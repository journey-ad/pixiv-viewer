<template>
  <div id="app">
    <Preload />
    <router-view />
  </div>
</template>

<script>
import Preload from "@/components/Preload";
export default {
  components: {
    Preload
  }
};
</script>

<style lang="stylus" scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 750px;
  margin: 0 auto;
}
</style>
