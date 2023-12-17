<template>
  <div class="nav-container">
    <ul class="nav-bar">
      <li
        class="nav-item"
        :class="{ active: $route.name === item.name }"
        @click="navigateTo(item.name)"
        v-for="item in navList"
        :key="item.name"
      >
        <Icon
          class="icon"
          :name="item.icon"
          :index="item.name"
          :currentIndex="$route.name"
        />
        <span>{{ item.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      navList: [
        {
          name: "Home",
          icon: "home",
          title: "首页",
        },
        // {
        //   name: "Novel",
        //   icon: "novel",
        //   title: "小说",
        // },
        {
          name: "Search",
          icon: "search",
          title: "搜索",
        },
        {
          name: "Rank",
          icon: "rank",
          title: "排行榜",
        },
        {
          name: "Setting",
          icon: "setting",
          title: "设置",
        },
      ],
    };
  },
  methods: {
    navigateTo(name, params) {
      if (this.$route.name === name) {
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        this.$router.push({ name, params });
      }
    },
  },
  mounted() {
    console.log(this.$route);
  },
};
</script>

<style lang="stylus" scoped>
.nav-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  height: calc(100px + env(safe-area-inset-bottom));
  z-index: 10;
  pointer-events: none;

  .nav-bar {
    display: flex;
    justify-content: space-between;
    background: #fff;
    /* border-radius: .7rem .7rem 0 0; */
    box-sizing: border-box;
    border-radius: 32px 32px 0 0;
    box-shadow: 0px 0px 20px #dedede;
    width: fit-content;
    min-width: 750px;
    height: 100%;
    margin: 0 auto;
    pointer-events: auto;

    li {
      position: relative;
      color: #969696;
      font-size: 20px;
      cursor: pointer;
      width: 20%;
      vertical-align: middle;
      text-align: center;
      margin: 0 10px;

      &.active {
        color: #333;
      }

      .icon {
        display: block;
        font-size: 58px;
        margin: 0 auto;
        margin-top: 0.1rem;
        color: #fffdf7;

        &.active {
          color: #F2C358;
        }
      }
    }
  }
}
</style>