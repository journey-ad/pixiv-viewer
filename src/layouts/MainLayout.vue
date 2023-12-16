<template>
  <div
    class="main-layout"
    :class="{ 'safe-area': safeArea }"
    :style="{ height: '100%' }"
  >
    <div class="app-main">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <Nav v-if="showNav" />
  </div>
</template>

<script>
import Nav from "@/components/Nav";
export default {
  data() {
    return {};
  },
  props: {
    safeArea: {
      type: Boolean,
      default: false,
    },
    showNav: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    showNav: {
      handler(val) {
        this.$root.$el.classList.toggle("show-nav", val);
      },
      immediate: true,
    },
  },
  components: {
    Nav,
  },
};
</script>

<style lang="stylus" scoped>
.main-layout {
  height: 100%;
  box-sizing: border-box;

  &.safe-area {
    padding-top: 60px;
    height: calc(100vh - 60px);
    padding-top: env(safe-area-inset-top);
    height: calc(100vh - env(safe-area-inset-top));
  }
}

.app-main {
  position: relative;

  // height: calc(100vh - 100px);
  // padding-bottom: 100px;
  // height: calc(100vh - env(safe-area-inset-bottom));
  // padding-bottom: env(safe-area-inset-bottom);
  &::-webkit-scrollbar {
    width: 0;
  }
}
</style>