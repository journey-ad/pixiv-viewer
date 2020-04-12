<template>
  <div class="nav">
    <router-link
      :to="{name: 'Rank', params:{type: route}}"
      v-for="(item, route) in menu"
      :key="route"
      tag="a"
      class="normal"
      :class="{cur: $route.params.type===route}"
      v-show="!item.x || isShowR18"
    >{{item.name}}</router-link>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  computed: {
    isShowR18() {
      return this.SETTING.r18;
    },
    ...mapState(["SETTING"])
  },
  data() {
    return {};
  },
  watch: {
    $route() {
      // this.init();
    }
  },
  methods: {
    init() {
      let cur = document.querySelector(".cur");
      cur && cur.scrollIntoView();
    }
  },
  mounted() {
    this.init();
  },
  updated() {
    this.init();
  }
};
</script>

<style lang="stylus" scoped>
.nav {
  width: 90%;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;

  a {
    display: inline-block;
    padding: 12px 20px;
    margin: 8px;
    border-radius: 24px;
    color: #333;
    background: #eee;
    box-sizing: border-box;
    scroll-margin: 120px;

    &.cur {
      background: #f2c358;
    }
  }
}</style>