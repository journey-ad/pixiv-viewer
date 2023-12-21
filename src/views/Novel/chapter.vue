<template>
  <div class="chapter" :data-censored="isCensored(novel)" ref="chapterEl">
    <div class="topbar__wrapper" :class="{ show: isMenuShow }">
      <div class="chapter-name">{{ novel.title }}</div>
      <TopBar :transparent="true" color="dark" :padding="false" />
      <div class="btn-setting" @click="$refs.novelReader.showSetting()">
        <Icon class="icon-setting" name="setting"></Icon>
      </div>
    </div>
    <transition name="fade">
      <div class="loading" v-if="loading">加载中...</div>
    </transition>
    <NovelReader
      :content="novel.content"
      :filter="novelFilter"
      @action:menu="(flag) => this.isMenuShow = flag"
      @action:parsed="handleParsed"
      ref="novelReader"
      v-if="!loading"
    ></NovelReader>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import { Tag } from "vant";
import TopBar from "@/components/TopBar";
import NovelReader from "./components/novel-reader";
import NovelMeta from "./components/novel-meta.vue";
import api from "@/api";

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
  },
  data() {
    return {
      loading: false,
      novel: {},
      isMenuShow: false,
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
  },
  methods: {
    init() {
      this.reset();
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      const id = +this.$route.params.id;
      this.getNovel(id);
    },
    reset() {
      this.loading = false;
      this.novel = {};
    },
    async getNovel(id) {
      this.loading = true;
      const res = await api.getNovel(id);

      if (res.status === 0) {
        this.novel = res.data;

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
    novelFilter(content) {
      const parser = (tag, from, to) => {
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
        const regex_cmd = /\[\[(?<tag>.*?):(?<from>.*?)\s?>\s?(?<to>.*?)\]\]/g;

        // [chapter:今生の别れ] -> <h2>今生の别れ</h2>
        const regex_tag = /\[(?<tag>.*?):(?<content>.*?)\]/g;

        line = line
          .replace(regex_cmd, (_, tag, from, to) => parser(tag, from, to))
          .replace(regex_tag, (_, tag, from, to) => parser(tag, from, to));

        return `<p>${line}</p>`;
      };

      return content.split("\n").map(parseLine).join("");
    },
    toTop() {
      this.$refs.chapterEl.scrollTo({ top: 0, behavior: "smooth" });
    },
    handleParsed($contentEL) {
      const metaEL = $contentEL.querySelector(".novel-content__header");
      NovelMeta.router = this.$router;
      const metaComp = Vue.extend(NovelMeta);
      new metaComp({ propsData: { novel: this.novel } }).$mount(metaEL);
    },
  },
  mounted() {
    this.init();
  },
  components: {
    [Tag.name]: Tag,
    TopBar,
    NovelReader,
  },
};
</script>

<style lang="stylus" scoped>
.chapter {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  z-index: 10;

  &[data-censored] {
    &::v-deep .novel-content__wrapper .novel-content__content {
      filter: blur(8px) opacity(0.5);
      user-select: none;
    }
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
</style>