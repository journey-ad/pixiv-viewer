<template>
  <div class="top-bar-wrap">
    <van-nav-bar class="top-bar" left-arrow :border="false" @click-left="back">
      <template #left>
        <Icon name="left-arrow" scale="2.6"></Icon>
      </template>
    </van-nav-bar>
  </div>
</template>

<script>
import { NavBar } from "vant";

let backCount = 0; // 连续返回次数

export default {
  props: {
    action: {
      type: Function,
    },
  },
  methods: {
    back() {
      if (this.action) {
        this.action();
        return;
      }

      if (history.length <= 2) {
        this.$router.push({ name: "Home" });
      } else {
        if (backCount >= 5) {
          // 连续返回5次后直接返回首页
          this.$router.replace({ name: "Home" });
          backCount = 0;
          return;
        }

        this.$router.back();
        backCount++;
      }
    },
  },
  components: {
    [NavBar.name]: NavBar,
  },
};
</script>

<style lang="stylus" scoped>
.top-bar-wrap {
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 40px;
  width: 100%;
  height: 160px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(#fff, 0));
  z-index: 99;
}

.top-bar {
  background: rgba(#000, 0);

  svg {
    font-size: 22px;
    color: #fafafa;
    filter: drop-shadow(2px 4px 4px rgba(#000, 0.8));
  }
}
</style>