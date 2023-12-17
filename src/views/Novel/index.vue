<template>
  <div class="novel-series">
    <TopBar />
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import TopBar from "@/components/TopBar";

export default {
  name: "Series",
  watch: {
    $route() {
      if (
        this.$route.name === "Novel" &&
        this.$route.params.id !== this.novel.id
      ) {
        this.init();
      }
    },
  },
  data() {
    return {
      loading: false,
      novel: {},
    };
  },
  components: {
    TopBar,
  },
};
</script>