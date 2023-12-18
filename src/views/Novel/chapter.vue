<template>
  <div class="chapter" @scroll="scrollHandler" ref="chapterEl">
    <div class="topbar__wrapper" :class="{ show: isActionShow }">
      <div class="chapter-name">{{ novel.title }}</div>
      <TopBar :transparent="true" color="dark" :padding="false" />
      <div class="btn-setting" @click="isSettingShow = !isSettingShow">
        <Icon class="icon-setting" name="setting"></Icon>
      </div>
    </div>
    <div
      class="novel-content__wrapper"
      :style="viewerStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleClickViewer"
      ref="novelContentWrapper"
    >
      <transition name="fade">
        <div class="loading" v-if="loading">加载中...</div>
      </transition>
      <!-- <NovelMeta :novel="novel" /> -->
      <template v-if="!loading">
        <div
          class="novel-content"
          :class="{ censored: isCensored(novel) }"
          v-html="parsedContent"
          ref="novelContentEl"
        ></div>
        <div class="page">{{ `${page} / ${total}` }}</div>
      </template>
    </div>
    <div class="setting__wrapper" :class="{ show: isSettingShow }">
      <transition name="fade">
        <div
          class="back-top"
          :class="{ show: isTopShow && isActionShow }"
          @click="toTop"
        >
          <Icon class="icon-top" name="top"></Icon>
        </div>
      </transition>
      <div class="action-panel">
        <div class="action-item slider">
          <span>A-</span>
          <van-slider
            v-model="readerConfig.fontSize.value"
            :min="readerConfig.fontSize.range[0]"
            :max="readerConfig.fontSize.range[1]"
            active-color="#ffcd59"
          >
            <template #button>
              <div class="slide-button">{{ readerConfig.fontSize.value }}</div>
            </template>
          </van-slider>
          <span class="big">A+</span>
        </div>
        <div class="row">
          <div class="action-item slider">
            <span>小</span>
            <van-slider
              v-model="readerConfig.padding.value"
              :min="readerConfig.padding.range[0]"
              :max="readerConfig.padding.range[1]"
              active-color="#ffcd59"
            >
              <template #button>
                <div class="slide-button">边距</div>
              </template>
            </van-slider>
            <span>大</span>
          </div>
          <div class="action-item slider">
            <span>紧</span>
            <van-slider
              v-model="readerConfig.lineHeight.value"
              :min="readerConfig.lineHeight.range[0]"
              :max="readerConfig.lineHeight.range[1]"
              :step="0.1"
              active-color="#ffcd59"
            >
              <template #button>
                <div class="slide-button">行距</div>
              </template>
            </van-slider>
            <span>松</span>
          </div>
        </div>
        <div class="action-item">
          <span>选择颜色</span>
          <span
            class="color"
            :class="{ active: readerConfig.theme.value === index }"
            :style="{
              color: item.color,
              backgroundColor: item.bg,
            }"
            @click="readerConfig.theme.value = index"
            v-for="(item, index) in themeList"
            :key="index"
            >字</span
          >
        </div>
        <div class="action-item">
          <span>选择字体</span>
          <span
            class="font"
            :class="{ active: readerConfig.fontFamily.value === index }"
            :style="{
              fontFamily: item.font,
            }"
            @click="readerConfig.fontFamily.value = index"
            v-for="(item, index) in fontList"
            :key="index"
            >{{ item.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { debounce } from "lodash";
import { Tag, Slider } from "vant";
import { mapGetters, mapState } from "vuex";
import TopBar from "@/components/TopBar";
import NovelMeta from "./components/novel-meta.vue";
import { setThemeColor } from "@/utils";
import { LocalStorage } from "@/utils/storage";
import api from "@/api";
import gsap from "gsap";

const _READER_SETTING_KEY = "__PIXIV_readerSetting";

let readerSetting = LocalStorage.get(_READER_SETTING_KEY, {
  fontSize: 15,
  padding: 14,
  lineHeight: 1.5,
  theme: 0,
  fontFamily: 0,
});

export default {
  name: "Chapter",
  watch: {
    $route: {
      handler() {
        if (this.$route.name === "Novel") {
          document.documentElement.classList.add("no-scroll");
        } else {
          document.documentElement.classList.remove("no-scroll");
        }

        if (
          this.$route.name === "Novel" &&
          this.$route.params.id !== this.novel.id
        ) {
          this.init();
        }
      },
      immediate: true,
    },
    readerConfig: {
      handler: debounce(function () {
        for (let key in this.readerConfig) {
          readerSetting[key] = this.readerConfig[key].value;
        }

        LocalStorage.set(_READER_SETTING_KEY, readerSetting);
      }, 300),
      deep: true,
    },
    viewerStyle: {
      handler: debounce(function () {
        setThemeColor(this.viewerStyle.backgroundColor);
        this.calcPageNum();
      }),
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      novel: {},
      parsedContent: "",
      readerConfig: {
        fontSize: {
          type: "number",
          value: 15,
          range: [12, 30],
        },
        padding: {
          type: "number",
          value: 14,
          range: [5, 50],
        },
        lineHeight: {
          type: "number",
          value: 1.5,
          range: [0.8, 3],
        },
        theme: {
          type: "number",
          value: 0,
          range: [0, 4],
        },
        fontFamily: {
          type: "number",
          value: 1,
          range: [0, 3],
        },
      },
      themeList: [
        { color: "#1f1f1f", bg: "#ffffff" },
        { color: "#1e1e1e", bg: "#f1f1f1" },
        { color: "#b7b7b7", bg: "#1f1f1f" },
        { color: "#1c1d1e", bg: "#e6f1fa" },
        { color: "#1f1e1c", bg: "#fff8eb" },
      ],
      fontList: [
        {
          name: "Sans",
          font: "Noto Sans SC",
        },
        {
          name: "Serif",
          font: "Noto Serif SC",
        },
      ],
      isSettingShow: false,
      isActionShow: false,
      isTopShow: false,
      page: 1,
      total: 1,
    };
  },
  computed: {
    ...mapGetters(["isCensored"]),
    tagText() {
      if (this.novel.x_restrict === 1) {
        return "R-18";
      } else if (this.novel.x_restrict === 2) {
        return "R-18G";
      } else {
        return false;
      }
    },
    viewerStyle() {
      return {
        "--padding": `${this.readerConfig.padding.value}px`,
        "--lineHeight": `${this.readerConfig.lineHeight.value}`,
        "--fontSize": `${this.readerConfig.fontSize.value}px`,
        "--color": this.themeList[this.readerConfig.theme.value].color,
        "--bg": this.themeList[this.readerConfig.theme.value].bg,
        paddingLeft: `var(--padding)`,
        paddingRight: `var(--padding)`,
        fontSize: `${this.readerConfig.fontSize.value}px`,
        lineHeight: `${this.readerConfig.lineHeight.value}`,
        fontFamily: this.fontList[this.readerConfig.fontFamily.value].font,
        color: this.themeList[this.readerConfig.theme.value].color,
        backgroundColor: this.themeList[this.readerConfig.theme.value].bg,
      };
    },
  },
  methods: {
    initSetting() {
      for (let key in readerSetting) {
        if (key in this.readerConfig) {
          this.readerConfig[key].value = readerSetting[key];
        }
      }
    },
    init() {
      this.reset();
      this.initSetting();
      setThemeColor(this.viewerStyle.backgroundColor);
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      const id = +this.$route.params.id;
      this.getNovel(id);
    },
    reset() {
      this.loading = false;
      this.novel = {};
      this.parsedContent = "";
    },
    async getNovel(id) {
      this.loading = true;
      const res = await api.getNovel(id);

      if (res.status === 0) {
        this.novel = res.data;

        this.parseNovel(this.novel);

        let title = "";
        if (this.novel.x_restrict === 1) {
          title += "[R-18] ";
        } else if (this.novel.x_restrict === 2) {
          title += "[R-18G] ";
        }

        title += `${this.novel.title}`;

        if (this.novel.series?.title) {
          title += ` | ${this.novel.series.title}`;
        }

        if (this.novel.user?.name) {
          title += ` /「${this.novel.user.name}」的作品`;
        }

        title += ` - pixiv-viewer`;

        document.title = title;

        if (this.isCensored(this.novel)) {
          this.$toast({
            message: "根据当前设置，此内容将不予显示",
            icon: require("@/svg/ban-view.svg"),
            duration: 3000,
          });
          setTimeout(() => {
            // this.$router.back();
          }, 5000);
        }
      }

      this.loading = false;
    },
    parseNovel(novel) {
      let content = novel.content;

      const parseMap = (tag, from, to) => {
        console.log(tag, from, to);
        switch (tag) {
          case "chapter": {
            return `<h2>${from}</h2>`;
          }
          case "rb": {
            return `<ruby>${from}<rt>${to}</rt></ruby>`;
          }
          default: {
            console.warn(`unknown tag: ${tag}`, from, to);
            return from;
          }
        }
      };

      const parseLine = (line) => {
        if (!line) return;

        // [[rb:至尊 > 皇帝]] -> <ruby>至尊<rt>皇帝</rt></ruby>
        const regex_cmd = /\[\[(?<tag>.*?):(?<from>.*?)\s?>\s?(?<to>.*?)\]\]/;

        // [chapter:今生の别れ] -> <h2>今生の别れ</h2>
        const regex_tag = /\[(?<tag>.*?):(?<content>.*?)\]/;

        line = line
          .replace(regex_cmd, (_, tag, from, to) => parseMap(tag, from, to))
          .replace(regex_tag, (_, tag, from, to) => parseMap(tag, from, to));

        return `<p>${line}</p>`;
      };

      content = content.split("\n").map(parseLine).join("");

      content = `<div class="novel-content__header"></div>
        <div class="novel-content__content">${content}</div>
        <div class="novel-content__footer">`;

      this.parsedContent = content;

      this.$nextTick(() => {
        const metaEL = this.$refs.novelContentEl.querySelector(
          ".novel-content__header"
        );
        NovelMeta.router = this.$router;
        const metaComp = Vue.extend(NovelMeta);
        new metaComp({ propsData: { novel } }).$mount(metaEL);

        setTimeout(() => {
          this.calcPageNum();
        }, 0);
      });
    },
    calcPageNum() {
      const wrapEL = this.$refs.novelContentWrapper;
      if (!wrapEL) return;

      this.total = Math.floor(
        wrapEL.scrollWidth / (wrapEL.clientWidth - readerSetting.padding)
      );
    },
    changePage(index) {
      if (index < 1 || index > this.total) return (this.isActionShow = true);

      const wrapEL = this.$refs.novelContentWrapper;
      const pageWidth = wrapEL.clientWidth - readerSetting.padding;

      gsap.to(wrapEL, {
        duration: 0.2,
        ease: "power1.inOut",
        scrollLeft: pageWidth * (index - 1),
      });

      this.page = index;

      console.log(
        "changePage",
        [this.page, this.total],
        [wrapEL.scrollLeft, wrapEL.scrollWidth],
        pageWidth
      );
    },
    addPage(num) {
      this.changePage(this.page + num);
    },
    toTop() {
      this.$refs.chapterEl.scrollTo({ top: 0, behavior: "smooth" });
    },
    handleClickViewer(e) {
      // 检测点击位置区域
      const { clientWidth, clientHeight } = this.$refs.chapterEl;
      const { clientX, clientY } = e;

      // 定义每个区域位置 使用左上角和右下角坐标确定
      const areaAxis = {
        // 顶部区域
        top: [
          [0, 0],
          [1, 0.4],
        ],
        // 底部左侧较窄区域
        back: [
          [0, 0.4],
          [0.3, 1],
        ],
        // 底部右侧较窄区域
        next: [
          [0.3, 0.4],
          [1, 1],
        ],
      };

      const area = Object.keys(areaAxis).find((key) => {
        const [min, max] = areaAxis[key];
        return (
          clientX / clientWidth >= min[0] && // 区域左侧
          clientX / clientWidth <= max[0] && // 区域右侧
          clientY / clientHeight >= min[1] && // 区域顶部
          clientY / clientHeight <= max[1] // 区域底部
        );
      });

      console.log(
        area,
        [clientX, clientY], // 坐标点
        [clientX / clientWidth, clientY / clientHeight], // 相对左上角位置
        e
      );

      switch (area) {
        case "top":
          this.handleActionDisplay();
          break;
        case "back":
          this.isActionShow = false;
          this.isSettingShow = false;
          this.addPage(-1);
          break;
        case "next":
          this.isActionShow = false;
          this.isSettingShow = false;
          this.addPage(1);
          break;
        default:
          console.warn("click area detect error");
          break;
      }
    },
    handleTouchStart() {
      if (this._locking) return;
      this._moveDistance = 0;
    },
    handleTouchMove(e) {
      if (this._locking) return;

      const { clientX } = e.touches[0];
      const wrapEL = this.$refs.novelContentWrapper;

      const lastX = this._lastX || clientX;

      let deltaX = lastX - clientX;
      this._lastX = clientX;

      // 滑动幅度较大时 乘以一个系数加速滑动
      if (Math.abs(deltaX) > 2.8) {
        deltaX *= 2;
      }

      // 记录滑动距离
      this._moveDistance += deltaX;

      // 对应移动元素
      wrapEL.scrollLeft += deltaX;
    },
    handleTouchEnd() {
      const { clientWidth } = this.$refs.novelContentWrapper;

      const lockMove = (ms) => {
        this._locking = true;
        setTimeout(() => {
          this._locking = false;
        }, ms);
      };

      // 滑动距离超过容器宽度的0.23倍时 触发翻页
      if (this._moveDistance < -clientWidth * 0.23) {
        this.addPage(-1);

        // 每次翻页后锁定移动60ms
        lockMove(60);
      } else if (this._moveDistance > clientWidth * 0.23) {
        this.addPage(1);

        // 每次翻页后锁定移动60ms
        lockMove(60);
      } else {
        // 否则恢复到原来的位置
        this.changePage(this.page);
      }

      this._lastX = null;
      this._moveDistance = 0;
    },
    scrollHandler() {
      const { scrollTop, clientHeight, scrollHeight } = this.$refs.chapterEl;
      if (scrollTop > 1200) {
        this.isTopShow = true;
      } else {
        this.isTopShow = false;
      }

      if (scrollTop >= scrollHeight - clientHeight) {
        this.isActionShow = true;
      }
    },
    handleActionDisplay() {
      if (this.isActionShow) {
        if (this.isSettingShow) {
          this.isSettingShow = false;
        } else {
          this.isActionShow = false;
        }
      } else {
        this.isActionShow = true;
      }
    },
  },
  mounted() {
    this.init();
  },
  components: {
    [Slider.name]: Slider,
    [Tag.name]: Tag,
    TopBar,
  },
};
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&display=swap');

:root {
  --color-fg: #1f1f1f;
  --color-bg: #ffffff;
}
</style>

<style lang="stylus" scoped>
.chapter {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  z-index: 10;
}

.topbar__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 84px;
  padding: 0 20px;
  padding-left: 100px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  outline: 2px solid rgba(#000, 0.1);
  background: rgba(#fff, 0.9);
  backdrop-filter: blur(4px);
  filter: drop-shadow(0px -5px 14px rgba(#000, 0.1));
  transform: translateY(calc(-100% - 100px));
  transition: transform 0.3s ease-in-out;
  z-index: 100;

  &.show {
    transform: translateY(0);
  }

  .top-bar-wrap {
    height: 100%;
  }

  .chapter-name {
    font-size: 28px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-setting {
    font-size: 0;
    z-index: 100;
    margin-left: auto;
    cursor: pointer;
  }

  .icon-setting {
    width: 50px;
    height: 50px;
  }
}

.novel-content__wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: color 0.3s, background 0.3s;
  user-select: text;
  box-sizing: border-box;
  overflow-x: hidden;

  .loading {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 34px;
    color: #1f1f1f;
  }

  .page {
    position: fixed;
    right: 15px;
    bottom: 6px;
    font-size: 24px;
    font-family: sans-serif;
    opacity: 0.65;
  }

  .novel-content {
    columns: calc(100vw - 2 * var(--padding)) 1;
    height: 100%;
    padding: var(--padding) 0;
    word-break: break-all;
    column-gap: calc(var(--padding));
    box-sizing: border-box;

    &.censored {
      filter: blur(16px) opacity(0.5);
      user-select: none;
    }

    &::v-deep {
      .novel-content__footer {
        height: 1px;
        width: 100%;
        margin: auto;
        margin-right: calc(var(--padding) * -1);
      }

      p {
        margin: 1em 0;
      }

      h2 {
        font-size: 1.5em;
      }
    }
  }
}

.setting__wrapper {
  position: fixed;
  bottom: 0;
  width: 100%;
  // height: 400px;
  padding: 30px 40px;
  padding-bottom: 10px;
  box-sizing: border-box;
  outline: 2px solid rgba(#000, 0.1);
  border-radius: 30px 30px 0 0;
  background: rgba(#fff, 0.9);
  backdrop-filter: blur(4px);
  filter: drop-shadow(0px -5px 14px rgba(#000, 0.1));
  transform: translateY(calc(100% + 100px));
  transition: transform 0.3s ease-in-out;

  &.show {
    transform: translateY(0);

    .back-top {
      top: -140px;
    }
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0 20px;
  }

  .action-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 26px 0;
    white-space: nowrap;

    &.slider {
      span {
        flex: none;
        display: inline-block;
        text-align: center;
        width: 30px;
      }

      .big {
        font-size: 1.3em;
      }

      .van-slider {
        height: 5px;
        margin: 0 2px;
        // filter: drop-shadow(0 1px 1px rgba(#000, 0.25));
        outline: 1px solid rgba(#000, 0.08);
        z-index: 5;

        .slide-button {
          width: 34px;
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          line-height: 1;
          color: #1f1f1f;
          background-color: #fff;
          border-radius: 100px;
          filter: drop-shadow(2px 4px 4px rgba(#000, 0.1));
        }
      }
    }

    .color {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 64px;
      font-size: 30px;
      line-height: 1;
      border: 2px solid #a6a6a6;
      border-radius: 50%;
      margin: 0 10px;
      cursor: pointer;

      &.active {
        border-color: #ffcd59;
      }
    }

    .font {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 42px;
      padding: 0 14px;
      margin: 0 10px;
      font-size: 24px;
      line-height: 1;
      border: 2px solid #a6a6a6;
      border-radius: 10px;
      cursor: pointer;

      &.active {
        border-color: #ffcd59;
      }
    }
  }
}

.back-top {
  position: absolute;
  right: 30px;
  top: -250px;
  cursor: pointer;
  transform: translateX(100% + 50px);
  transition: all 0.3s ease-in-out;

  &.show {
    transform: translateX(0);
  }

  .icon-top {
    width: 100px;
    height: 100px;
  }
}

@media screen and (min-width: 768px) {
  .setting__wrapper {
    right: 0;
    width: 600px;
    margin: 0 auto;

    .action-item {
      font-size: 20px;
    }
  }

  .novel-content__wrapper {
    .novel-meta {
      max-width: 1200px;
    }

    .novel-content {
      max-width: 1200px;
      margin: 0 auto;
    }
  }
}
</style>