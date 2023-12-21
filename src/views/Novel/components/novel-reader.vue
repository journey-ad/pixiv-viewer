<template>
  <div class="novel-reader" ref="readerEL">
    <div
      class="novel-content__wrapper"
      :style="viewerStyle"
      @pointerdown.prevent.stop="handleTouchStart"
      @pointermove.stop.prevent="handleTouchMove"
      @pointerup.prevent.stop="handleTouchEnd"
      v-prevent="['touchmove', 'mousemove']"
      ref="novelContentWrapper"
    >
      <div class="page-counter">{{ `${pageNum} / ${pageTotal}` }}</div>
      <template>
        <div class="novel-content" v-html="parsedContent" ref="novelContentEl"></div>
      </template>
    </div>
    <div class="setting__wrapper" :class="{ show: isSettingShow }">
      <transition name="fade">
        <div
          class="back-top"
          :class="{ show: isTopShow && isMenuShow }"
          @click="$emit('action:to-top')"
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
                parseNovel();
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
import { Slider } from "vant";
import { debounce } from "lodash";
import gsap from "gsap";
import * as OpenCC from "opencc-js";
import { LocalStorage } from "@/utils/storage";
import { setThemeColor } from "@/utils";

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
  name: "novel-reader",
  components: {
    [Slider.name]: Slider,
  },
  props: {
    content: {
      type: String,
      default: "",
    },
    filter: {
      type: Function,
      default: (content) =>
        content
          .split("\n")
          .map((line) => `<p>${line}</p>`)
          .join(""),
    },
  },
  watch: {
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
    content: {
      handler: debounce(function () {
        this.reset();
        this.parseNovel();
      }, 300),
      immediate: true,
    },
    isMenuShow: {
      handler: function () {
        this.$emit("action:menu", this.isMenuShow);
      },
    },
  },
  computed: {
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
  data() {
    return {
      pageNum: 1,
      pageTotal: 1,
      parsedContent: "",
      isMenuShow: false,
      isSettingShow: false,
      isTopShow: false,
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
    };
  },
  created() {
    this.initSetting();
  },
  methods: {
    reset() {
      this.pageNum = 1;
      this.pageTotal = 1;
      this.parsedContent = "";
    },
    initSetting() {
      for (let key in readerSetting) {
        if (key in this.readerConfig) {
          this.readerConfig[key].value = readerSetting[key];
        }
      }
      setThemeColor(this.viewerStyle.backgroundColor);
    },
    parseNovel() {
      if (!this.content) return;

      let content = this.content;
      // content = "载".repeat(10000);

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

      // 调用传入的过滤器
      content = this.filter(content);

      content = `<div class="novel-content__header"></div>
        <div class="novel-content__content">${content}</div>
        <div class="novel-content__footer">`;

      this.parsedContent = content;

      this.$nextTick(() => {
        this.$emit("action:parsed", this.$refs.novelContentEl);
        this.calcPageNum();
      });
    },
    calcPageNum() {
      const wrapEL = this.$refs.novelContentWrapper;
      if (!wrapEL) return;

      this.pageTotal = Math.ceil(wrapEL.scrollWidth / wrapEL.clientWidth);
    },
    handleClickViewer(e) {
      // 检测点击位置区域
      const { clientWidth, clientHeight } = this.$refs.readerEL;
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
          this.isMenuShow = false;
          this.isSettingShow = false;
          this.addPage(-1, false);
          break;
        case "next":
          this.isMenuShow = false;
          this.isSettingShow = false;
          this.addPage(1, false);
          break;
        default:
          console.warn("click area detect error");
          break;
      }
    },
    handleTouchStart() {
      this._lastX = null;
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

      // 设置页面位移
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
      const { clientWidth } = this.$refs.novelContentWrapper;
      const handleSwipe = (threshold = 0.35) => {
        if (this._moveDistance < -clientWidth * threshold) {
          this.addPage(-1);
        } else if (this._moveDistance > clientWidth * threshold) {
          this.addPage(1);
        } else {
          // 否则恢复到原来的位置
          this.changePage(this.pageNum);
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

      if (Date.now() - this._startTime <= 200) {
        // 快速滑动时 触发翻页距离缩短
        handleSwipe(0.06);
      } else {
        // 慢慢滑动时 正常计算翻页所需距离
        handleSwipe(0.35);
      }
    },
    changePage(index, animate = true) {
      // 已经是首尾 仍然继续翻页时 提示已经到头了
      if (index < 1 || index > this.pageTotal) {
        this.$toast({
          message: index < 1 ? "已经是第一页了" : "已经是最后一页了",
          duration: 2000,
        });

        this.isMenuShow = true;

        index = Math.min(Math.max(index, 1), this.pageTotal);
      }

      // 从首尾往回翻页时 隐藏菜单
      if (
        (this.pageNum === this.pageTotal && index < this.pageTotal) ||
        (this.pageNum === 1 && index > 1)
      ) {
        this.isMenuShow = false;
      }

      this.pageNum = index;

      const wrapEL = this.$refs.novelContentWrapper;
      const contentEL = this.$refs.novelContentEl;
      const pageWidth = wrapEL.clientWidth;

      if (contentEL._gsapInstance) contentEL._gsapInstance.pause().kill();
      contentEL._gsapInstance = gsap.to(contentEL, {
        duration: animate ? 0.2 : 0,
        ease: "power1.inOut",
        x: -pageWidth * (index - 1),
        onComplete: () => {
          console.log(
            "changePage",
            [this.pageNum, this.pageTotal],
            [gsap.getProperty(contentEL, "x") * -1, contentEL.scrollWidth],
            pageWidth
          );
          contentEL._gsapInstance = null;
        },
      });
    },
    addPage(num, animate = true) {
      this.changePage(this.pageNum + num, animate);
    },
    scrollHandler() {
      const { scrollTop, clientHeight, scrollHeight } = this.$refs.readerEL;
      if (scrollTop > 1200) {
        this.isTopShow = true;
      } else {
        this.isTopShow = false;
      }

      if (scrollTop >= scrollHeight - clientHeight) {
        this.isMenuShow = true;
      }
    },
    handleActionDisplay() {
      if (this.isMenuShow) {
        if (this.isSettingShow) {
          this.isSettingShow = false;
        } else {
          this.isMenuShow = false;
        }
      } else {
        this.isMenuShow = true;
      }
    },
    showSetting() {
      this.isSettingShow = !this.isSettingShow;
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
};
</script>

<style lang="less">
@import (css)
  url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Serif+SC:wght@500;700&display=swap");
</style>

<style lang="less" scoped>
.novel-reader {
  height: 100%;

  .page-counter {
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

    &::v-deep {
      .novel-content__footer {
        width: 100%;
        margin: auto;
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
      padding: 0;

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
