<template>
  <div :class="{'safe-area': safeArea}">
    <div class="app-main">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <Nav></Nav>
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
      default: false
    }
  },
  components: {
    Nav
  }
};
</script>

<style lang="stylus" scoped>
.safe-area {
  padding-top: 60px;
}

.app-main {
  position: relative;
  height: calc(100vh - 64px);
  // height: 100vh;
  padding-bottom: 64px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 0;
  }
}
</style>