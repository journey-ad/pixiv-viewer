<template>
  <div class="search">
    <form class="search-bar-wrap" :class="{dropdown: focus}" action="/">
      <van-search
        class="search-bar"
        v-model="keywords"
        shape="round"
        placeholder="请输入搜索关键词"
        maxlength="50"
        @search="onSearch"
        @cancel="onCancel"
        @focus="onFocus"
        @blur="onBlur(false)"
      />
      <div class="search-bar-word" @click="handleWordsClick($event)" ref="words">
        <span class="placeholder" v-if="keywordsList.length===0 && !lastWord">请输入搜索关键词</span>
        <div class="word" v-for="(keyword, index) in keywordsList" :key="index">
          <span class="text">{{keyword}}</span>
          <span class="close" :data-index="index"></span>
        </div>
        <div class="word" v-if="lastWord">
          <span class="text no-line">{{lastWord}}</span>
        </div>
      </div>
      <div class="search-history" v-if="focus">
        <div class="title-bar">
          历史搜索
          <Icon name="del" scale="2" @click.stop="clearHistory"></Icon>
        </div>
        <div
          class="keyword"
          @click="searchTag(keyword)"
          v-for="(keyword, index) in searchHistory"
          :key="index"
        >{{keyword}}</div>
      </div>
    </form>
    <div class="list-wrap" :class="{mask: focus}">
      <div class="result-list"></div>
      <Tags @search="searchTag" />
    </div>
    <transition name="fade">
      <div class="mask" @click="onBlur(true)" v-show="focus"></div>
    </transition>
  </div>
</template>

<script>
import { Search } from "vant";
import Tags from "./components/Tags";
export default {
  data() {
    return {
      keywords: "", // 关键词搜索框真实搜索内容
      keywordsList: [], // 关键词搜索框分词列表（空格分割）
      lastWord: "", // 正在输入的关键词
      focus: false, // 编辑框是否获取焦点
      artList: [], // 作品列表
      searchHistory: [
        "魅惑のふともも",
        "着衣巨乳",
        "ティファ・ロックハート",
        "魅惑のふともも",
        "着衣巨乳",
        "ティファ・ロックハート",
        "魅惑のふともも",
        "着衣巨乳",
        "ティファ・ロックハート"
      ]
    };
  },
  watch: {
    keywords() {
      // 当关键词内容发生变化
      let keywordsList = this.keywords
        .replace(/\s\s+/g, " ") // 去除多余空格（'abc   ' => 'abc '）
        .trimLeft() // 去除开头空白字符
        .split(" "); // 按空格分割

      if (keywordsList.length === 1 && keywordsList[0] === "") {
        // 只输入空格的情况清空关键词列表并返回
        this.keywordsList = [];
        return;
      }

      this.lastWord = keywordsList.pop(); // 最顶部的元素即为正在输入的关键词

      this.keywordsList = keywordsList; // 设置关键词组

      this.$nextTick(() => {
        // 保持滚动条在尾部，使用nextTick确保及时更新
        this.$refs.words.scrollLeft = this.$refs.words.clientWidth;
      });
    }
  },
  computed: {},
  methods: {
    handleWordsClick(e) {
      // 处理点击事件
      let target = e.target;
      if (target.className !== "close") {
        // 点击对象不为关闭按钮则输入框获取焦点
        document.querySelector('input[type="search"]').focus();
        return;
      } else {
        let keywordsList = this.keywords.trim().split(" "); // 关键词按空格分割
        keywordsList.splice(target.dataset.index, 1); // 移除点击对象对应索引的关键词
        this.keywords = keywordsList.join(" ") + " "; // 赋值回去
      }
    },
    onSearch(val) {},
    onCancel() {},
    onFocus() {
      this.focus = true; // 获取焦点
    },
    onBlur(flag) {
      this.keywords = `${this.keywords} `.replace(/\s\s+/g, " "); // 去除多余空格
      this.$nextTick(() => {
        this.$refs.words.scrollLeft = this.$refs.words.clientWidth; // 滚动至最后
      });

      if (flag) this.focus = false; // 失去焦点
    },
    searchTag(keywords) {
      this.keywords = keywords + " ";
      this.onBlur(true);
    },
    clearHistory() {
      this.searchHistory = [];
      console.log(this.searchHistory);
    }
  },
  mounted() {
    let input = document.querySelector('input[type="search"]');
    document.addEventListener("selectionchange", () => {
      if (this.focus)
        input.setSelectionRange(input.value.length, input.value.length);
    });
  },
  components: {
    Tags,
    [Search.name]: Search
  }
};
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.search {
  position: relative;
  padding-top: 148px;
  height: calc(100% - 148px);

  .search-bar-wrap {
    position: absolute;
    top: 0;
    width: 100%;
    min-height: 148px;
    background: #fff;
    z-index: 1;
    transition: all 0.2s;

    &.dropdown {
      // height: 500px;
    }

    .search-bar {
      position: absolute;
      width: 100%;
      top: 40px;

      ::v-deep input {
        display: inline-block;
        opacity: 0;
      }
    }

    .search-bar-word {
      position: absolute;
      top: 70px;
      left: 88px;
      font-size: 0;
      width: 100%;
      max-width: 580px;
      height: 42px;
      border-radius: 8px;
      overflow-x: scroll;
      white-space: nowrap;

      .placeholder {
        font-size: 28px;
        line-height: 42px;
        color: #adadad;
      }

      // box-sizing: border-box;
      ::v-deep .word {
        display: inline-block;
        color: #fff;
        background: #7bb7e7;
        padding: 4px 8px;
        margin: 0 4px;
        border-radius: 8px;
        font-size: 28px;
        overflow: hidden;

        .text {
          border-right: 1px solid #acd9fd;
          padding-right: 8px;

          &.no-line {
            border-color: transparent;
          }
        }

        .close {
          display: inline-block;
          width: 24px;
          height: 24px;
          background: url('~@/svg/close.svg');
          background-size: 100%;
        }
      }
    }

    .search-history {
      // position: absolute;
      margin-top: 150px;
      margin-bottom: 20px;
      width: 100%;
      padding: 0 6px;
      box-sizing: border-box;
      overflow: hidden;

      .title-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        font-size: 26px;
        margin: 8px 20px;
      }

      .keyword {
        float: left;
        font-size: 24px;
        padding: 12px 20px;
        background: #eaeaea;
        border-radius: 26px;
        margin: 12px 12px;
        user-select: none;
      }
    }
  }

  .list-wrap {
    position: relative;
    height: 100%;
    overflow-y: scroll;
  }

  .mask {
    position: absolute;
    top: 148px;
    width: 100%;
    height: calc(100% - 124px);
    box-sizing: border-box;
    // pointer-events: none;
    background: rgba(0, 0, 0, 0.6);
    transition: all 0.2s;
  }
}
</style>