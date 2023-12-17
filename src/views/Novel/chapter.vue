<template>
  <div class="chapter" v-if="novel.id" @scroll="scrollHandler" ref="chapterEl">
    <div class="topbar__wrapper" :class="{ show: isActionShow }">
      <div class="chapter-name">{{ novel.title }}</div>
      <TopBar :transparent="true" color="dark" :padding="false" />
      <div class="btn-setting" @click="isSettingShow = !isSettingShow">
        <Icon class="icon-setting" name="setting"></Icon>
      </div>
    </div>
    <div
      class="novel-content__wrapper"
      :style="{
        fontFamily: fontList[readerConfig.fontFamily.value].font,
        backgroundColor: themeList[readerConfig.theme.value].bg,
      }"
      @click="handleActionDisplay"
    >
      <div class="novel-meta">
        <h1 class="novel-title">
          <van-tag
            class="tag"
            round
            :color="tagText === 'R-18' ? '#fb7299' : '#ff3f3f'"
            v-if="tagText"
          >
            {{ tagText }}
          </van-tag>
          {{ novel.title }}
        </h1>
        <div class="info-box">
          <router-link
            class="info author"
            :to="{
              name: 'Users',
              params: { id: novel.user.id },
            }"
          >
            {{ novel.user.name }}
          </router-link>
          <span class="info words">
            <Icon name="novel" class="icon" scale="1.1"></Icon
            >{{ novel.text_length.toLocaleString("en-US") }}字
          </span>
          <span class="info like">
            <Icon name="like" class="icon"></Icon>
            {{ novel.like.toLocaleString("en-US") }}
          </span>
          <span class="pixiv">
            <a
              :href="`https://www.pixiv.net/novel/show.php?id=${novel.id}`"
              target="_blank"
              rel="noreferrer"
              title="前往Pixiv查看作品"
            >
              <Icon name="pixiv" class="icon"></Icon>
            </a>
          </span>
        </div>
        <div class="tag-box">
          <router-link
            class="tag"
            :to="{
              name: 'Search',
              query: { type: 'novel', keyword: tag.name },
            }"
            v-for="tag in novel.tags"
            :key="tag.name"
            >#{{ tag.name }}</router-link
          >
        </div>
      </div>
      <div
        class="novel-content"
        :class="{ censored: isCensored(novel) }"
        :style="viewerStyle"
        v-html="parsedContent"
      ></div>
    </div>
    <div class="action__wrapper" :class="{ show: isSettingShow }">
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
import { debounce } from "lodash";
import { Tag, Slider } from "vant";
import { mapGetters, mapState } from "vuex";
import TopBar from "@/components/TopBar";
import { LocalStorage } from "@/utils/storage";
import api from "@/api";

const _READER_SETTING_KEY = "__PIXIV_readerSetting";

const readerSetting = LocalStorage.get(_READER_SETTING_KEY, {
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
        const _setings = {};
        for (let key in this.readerConfig) {
          _setings[key] = this.readerConfig[key].value;
        }

        LocalStorage.set(_READER_SETTING_KEY, _setings);
      }, 300),
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
        paddingLeft: `${this.readerConfig.padding.value}px`,
        paddingRight: `${this.readerConfig.padding.value}px`,
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
      this.initSetting();
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      this.loading = true;
      const id = +this.$route.params.id;
      this.novel = {};
      this.getNovel(id);
    },
    async getNovel(id) {
      const res = await api.getNovel(id);

      if (res.status === 0) {
        this.novel = res.data;

        this.parseNovel(this.novel);

        this.loading = false;

        let title = "";
        if (this.novel.x_restrict === 1) {
          title += "[R-18] ";
        } else if (this.novel.x_restrict === 2) {
          title += "[R-18G] ";
        }

        title += `${this.novel.title}`;

        if (this.novel.series) {
          title += ` | ${this.novel.series.title}`;
        }

        if (this.novel.user) {
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

      this.parsedContent = content;
    },
    toTop() {
      this.$refs.chapterEl.scrollTo({ top: 0, behavior: "smooth" });
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
  min-height: 100%;
  overflow: hidden;
  transition: color 0.3s, background 0.3s;
  user-select: text;

  .novel-meta {
    color: #1f1f1f;
    background: #e6f1fa;
    border: 2px solid #eaeaea;
    border-radius: 10px;
    padding: 14px 20px;
    margin: 25px auto;
    max-width: calc(100% - 100px);
    box-shadow: 0px 24px 15px -16px rgba(#000, 0.15);

    .novel-title {
      font-size: 36px;
      line-height: 1.4;
      margin-bottom: 10px;

      .tag {
        font-size: 24px;
      }
    }

    .info-box {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .info {
        display: flex;
        align-items: center;
        margin-right: 14px;
        color: #444;
        font-size: 24px;

        .icon {
          color: #ffcd59;
        }
      }

      .pixiv {
        margin-left: 20px;
        cursor: pointer;

        .icon {
          width: auto;
          height: 28px;
        }
      }
    }

    .tag-box {
      word-break: break-word;

      .tag {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 4px;
        font-size: 24px;
        color: #0096fa;
      }
    }
  }

  .novel-content {
    padding: 0 20px;
    font-size: 28px;
    font-weight: 400;
    // color: var(--color-fg, #1f1f1f);
    // background: var(--color-bg, #fff);
    transition: color 0.3s, background 0.3s;

    &.censored {
      filter: blur(16px) opacity(0.5);
      user-select: none;
    }

    &::v-deep {
      p {
        margin: 1em 0;
      }

      h2 {
        font-size: 1.5em;
      }
    }
  }
}

.action__wrapper {
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
  .action__wrapper {
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