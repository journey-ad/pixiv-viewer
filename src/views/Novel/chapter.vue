<template>
  <div class="chapter" ref="chapterEl">
    <div class="topbar__wrapper" :class="{ show: isActionShow }">
      <div class="chapter-name">{{ novel.title }}</div>
      <TopBar :transparent="true" color="dark" :padding="false" />
      <div class="btn-setting" @click="isSettingShow = !isSettingShow">
        <Icon class="icon-setting" name="setting"></Icon>
      </div>
    </div>
    <div class="page">{{ `${page} / ${total}` }}</div>
    <transition name="fade">
      <div class="loading" v-if="loading">加载中...</div>
    </transition>
    <div
      class="novel-content__wrapper"
      :style="viewerStyle"
      @pointerdown.prevent.stop="handleTouchStart"
      @pointermove.stop.prevent="handleTouchMove"
      @pointerup.prevent.stop="handleTouchEnd"
      v-prevent="['touchmove', 'mousemove']"
      ref="novelContentWrapper"
    >
      <!-- <NovelMeta :novel="novel" /> -->
      <template v-if="!loading">
        <div
          class="novel-content"
          :class="{ censored: isCensored(novel) }"
          v-html="parsedContent"
          ref="novelContentEl"
        ></div>
      </template>
    </div>
    <div class="setting__wrapper" :class="{ show: isSettingShow }">
      <transition name="fade">
        <div class="back-top" :class="{ show: isTopShow && isActionShow }" @click="toTop">
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
          <span class="label">选择颜色</span>
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
          >字</span>
        </div>
        <div class="action-item">
          <span class="label">选择字体</span>
          <span
            class="btn font"
            :class="{ active: readerConfig.fontFamily.value === index }"
            :style="{
              fontFamily: item.font,
            }"
            @click="readerConfig.fontFamily.value = index"
            v-for="(item, index) in fontList"
            :key="index"
          >{{ item.name }}</span>
        </div>
        <div class="action-item">
          <span class="label">文字样式</span>
          <span
            class="btn bold-switch"
            :class="{ active: readerConfig.bold.value }"
            @click="readerConfig.bold.value = !readerConfig.bold.value"
          >B</span>
          <span
            class="btn zh-trans"
            @click="
              () => {
                readerConfig.zhTrans.value++;
                if (readerConfig.zhTrans.value > 2) {
                  readerConfig.zhTrans.value = 0;
                }
                parseNovel(novel);
              }
            "
          >
            <em
              :class="{ cur: readerConfig.zhTrans.value === index }"
              v-for="(char, index) in '原简繁'"
              :key="index"
            >{{ char }}</em>
          </span>
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
import * as OpenCC from "opencc-js";

const _READER_SETTING_KEY = "__PIXIV_readerSetting";

let readerSetting = LocalStorage.get(_READER_SETTING_KEY, {
  fontSize: 15,
  padding: 14,
  lineHeight: 1.5,
  theme: 0,
  fontFamily: 0,
  bold: false,
  zhTrans: 0,
});

const converter = {
  s2t: new OpenCC.Converter({
    from: "cn",
    to: "tw",
  }),
  t2s: new OpenCC.Converter({
    from: "tw",
    to: "cn",
  }),
};

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
        bold: {
          type: "boolean",
          value: false,
        },
        zhTrans: {
          type: "number",
          value: 0,
          range: [0, 2],
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
        fontWeight: this.readerConfig.bold.value ? "bold" : "normal",
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
      // content = "载".repeat(10000);

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

      const _now = Date.now();
      switch (this.readerConfig.zhTrans.value) {
        case 1: {
          content = converter.t2s(content);
          console.log(`繁 -> 简 耗时: ${Date.now() - _now}ms`);
          break;
        }
        case 2: {
          content = converter.s2t(content);
          console.log(`简 -> 繁 耗时: ${Date.now() - _now}ms`);
          break;
        }
      }

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

      this.total = Math.ceil(wrapEL.scrollWidth / wrapEL.clientWidth);
    },
    changePage(index, animate = true) {
      // 已经是首尾 仍然继续翻页时 提示已经到头了
      if (index < 1 || index > this.total) {
        this.$toast({
          message: index < 1 ? "已经是第一页了" : "已经是最后一页了",
          duration: 2000,
        });

        this.isActionShow = true;

        index = Math.min(Math.max(index, 1), this.total);
      }

      // 从首尾往回翻页时 隐藏顶栏
      if (
        (this.page === this.total && index < this.total) ||
        (this.page === 1 && index > 1)
      ) {
        this.isActionShow = false;
      }

      this.page = index;

      const wrapEL = this.$refs.novelContentWrapper;
      const contentEL = this.$refs.novelContentEl;
      const pageWidth = wrapEL.clientWidth;

      if (contentEL._gsapInstance) contentEL._gsapInstance.pause().kill();
      contentEL._gsapInstance = gsap.to(contentEL, {
        duration: animate ? 0.2 : 0,
        ease: "power1.inOut",
        // scrollLeft: pageWidth * (index - 1),
        x: -pageWidth * (index - 1),
      });

      console.log(
        "changePage",
        [this.page, this.total],
        // [wrapEL.scrollLeft, wrapEL.scrollWidth],
        [contentEL._gsap.x, contentEL.clientWidth],
        pageWidth
      );
    },
    addPage(num, animate = true) {
      this.changePage(this.page + num, animate);
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
        // 顶部区域 宽0.8 高0.3
        top: [
          [0, 0],
          [0.8, 0.3],
        ],
        // 中心区域 宽0.2 高0.2
        center: [
          [0.4, 0.4],
          [0.6, 0.6],
        ],
        // 底部左侧较窄区域 宽0.3 高0.7
        back: [
          [0, 0.3],
          [0.3, 1],
        ],
        // 剩余区域
        next: [
          [0, 0],
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
        case "center":
          this.handleActionDisplay();
          break;
        case "back":
          this.isActionShow = false;
          this.isSettingShow = false;
          this.addPage(-1, false);
          break;
        case "next":
          this.isActionShow = false;
          this.isSettingShow = false;
          this.addPage(1, false);
          break;
        default:
          console.warn("click area detect error");
          break;
      }
    },
    handleTouchStart(e) {
      this._moveDistance = 0;
      this._startTime = Date.now();
      this._isTouching = true;
    },
    handleTouchMove(e) {
      if (!this._isTouching) return;
      if (this._locking) return;

      const { clientX } = e;
      const contentEL = this.$refs.novelContentEl;

      const currentX = gsap.getProperty(contentEL, "x");

      const lastX = this._lastX || clientX;

      let deltaX = lastX - clientX;
      this._lastX = clientX;

      if (
        currentX > 0 ||
        currentX < -contentEL.scrollWidth + contentEL.clientWidth
      ) {
        // 边界情况下 滑动幅度减小为0.3倍
        deltaX *= 0.3;
      } else {
        // 滑动幅度较大时 乘以一个系数加速滑动
        const deltaX_abs = Math.abs(deltaX);
        if (deltaX_abs > 1.8) {
          deltaX *= 1.5;
        } else if (deltaX_abs > 1.3) {
          deltaX *= 1.1;
        }
      }

      // 记录滑动距离
      this._moveDistance += deltaX;

      // 对应移动元素
      // wrapEL.scrollLeft += deltaX;
      gsap.set(contentEL, { x: `-=${deltaX}` });
    },
    handleTouchEnd(e) {
      this._isTouching = false;

      // 锁定移动
      const lockMove = (ms) => {
        this._locking = true;
        if (this._lockTimer) clearTimeout(this._lockTimer);
        this._lockTimer = setTimeout(() => {
          this._locking = false;
        }, ms);
      };

      // 根据滑动距离判断翻页
      const handleSwipe = (threshold = 0.35) => {
        if (this._moveDistance < -clientWidth * threshold) {
          this.addPage(-1);
        } else if (this._moveDistance > clientWidth * threshold) {
          this.addPage(1);
        } else {
          // 否则恢复到原来的位置
          this.changePage(this.page);
        }
      };

      // 处理点击操作
      if (
        Date.now() - this._startTime < 200 &&
        Math.abs(this._moveDistance) < 10
      ) {
        lockMove(200); // 点击翻页时 锁定200ms 防止手滑变成滑动翻页
        this.handleClickViewer(e);
        return;
      }

      const { clientWidth } = this.$refs.novelContentWrapper;

      if (Date.now() - this._startTime <= 200) {
        // 快速滑动时 触发翻页距离缩短
        handleSwipe(0.06);
      } else {
        // 慢慢滑动时 正常计算翻页所需距离
        handleSwipe(0.35);
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
  directives: {
    prevent: {
      inserted(el, binding) {
        const evtList = binding.value || [];

        console.log("prevent", evtList);

        evtList.forEach((evt) => {
          el.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        });
      },
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
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Serif+SC:wght@500;700&display=swap');

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
  box-sizing: border-box;
  z-index: 10;

  .page {
    position: absolute;
    right: 15px;
    bottom: 6px;
    bottom: calc(6px + env(safe-area-inset-bottom));
    font-size: 24px;
    font-family: sans-serif;
    opacity: 0.65;
    z-index: 10;
    pointer-events: none;
  }

  .loading {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 34px;
    color: #1f1f1f;
    z-index: 20;
  }
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
  height: 100%;
  transition: color 0.3s, background 0.3s;
  user-select: text;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));

  .novel-content {
    columns: calc(100vw - 2 * var(--padding)) 1;
    height: 100%;
    padding: var(--padding) 0;
    word-break: break-all;
    column-gap: calc(var(--padding) * 2);
    box-sizing: border-box;
    text-align: justify;

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
        margin: 0;
        margin-bottom: 1em;
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
  z-index: 50;

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

    .label {
      margin-right: 10px;

      & + span {
        margin-left: 10px;
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

    .btn {
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

    .bold-switch {
      width: 50px;

      &.active {
        font-weight: bold;
      }
    }

    .zh-trans {
      display: flex;
      align-items: center;
      line-height: 1;

      em {
        font-size: 20px;

        &.cur {
          font-size: 28px;
        }
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