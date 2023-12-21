<template>
  <div class="novels">
    <van-cell
      class="cell"
      :border="false"
      is-link
      @click="onClick()"
      v-if="once"
    >
      <template #title>
        <span class="title">
          小说作品
          <span class="num" v-if="num">{{ num }}件作品</span>
        </span>
      </template>
    </van-cell>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="!once || !artList.length ? '没有更多了' : ''"
      :error.sync="error"
      error-text="网络异常，点击重新加载"
      @load="getMemberNovel()"
    >
      <div class="card-box__wrapper" ref="cardBox">
        <waterfall
          :col="col"
          :width="itemWidth"
          :gutterWidth="0"
          :data="artList"
        >
          <router-link
            :to="{
              name: 'Novel',
              params: { id: art.id, list: artList },
            }"
            v-for="art in artList"
            :key="art.id"
          >
            <NovelCard mode="meta" :artwork="art" />
          </router-link>
        </waterfall>
      </div>
    </van-list>
  </div>
</template>

<script>
import { Cell, Swipe, SwipeItem, Icon, List, PullRefresh } from "vant";
import NovelCard from "@/components/NovelCard";
import api from "@/api";
import { throttle, uniqBy } from "lodash-es";
export default {
  name: "AuthorNovels",
  props: {
    id: {
      type: Number,
      required: true,
    },
    num: {
      type: Number,
    },
    once: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      col: 1,
      itemWidth: 0,
      curPage: 1,
      artList: [],
      error: false,
      loading: false,
      finished: false,
    };
  },
  methods: {
    reset() {
      this.curPage = 1;
      this.artList = [];
    },
    getMemberNovel: throttle(async function () {
      if (!this.id) return;
      let newList;
      let res = await api.getMemberNovel(this.id, this.curPage);
      if (res.status === 0) {
        if (res.finished) {
          this.finished = true;
          this.loading = false;
          return;
        }

        newList = res.data;
        if (this.once) newList = newList.slice(0, 10);
        let artList = JSON.parse(JSON.stringify(this.artList));

        artList.push(...newList);
        artList = uniqBy(artList, "id");

        this.artList = artList;
        this.loading = false;
        this.curPage++;
        if (this.once || this.curPage > 20) this.finished = true;
        this.$nextTick(this.resize);
      } else {
        this.$toast({
          message: res.msg,
        });
        this.loading = false;
        this.error = true;
      }
    }, 500),
    odd(list) {
      return list.filter((_, index) => (index + 1) % 2);
    },
    even(list) {
      return list.filter((_, index) => !((index + 1) % 2));
    },
    toArtwork(id) {
      this.$router.push({
        name: "Artwork",
        params: { id, list: this.artList },
      });
    },
    onClick() {
      this.$emit("onCilck");
    },
    resize() {
      if (!this.$refs.cardBox) return;

      this.itemWidth = Math.floor(
        this.$refs.cardBox.firstChild.clientWidth / this.col
      );
    },
  },
  mounted() {
    this.reset();
    this.getMemberNovel();
    window.addEventListener("resize", this.resize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resize);
  },
  components: {
    [Cell.name]: Cell,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Icon.name]: Icon,
    [List.name]: List,
    [PullRefresh.name]: PullRefresh,
    NovelCard,
  },
};
</script>

<style lang="stylus" scoped>
.novels {
  .cell {
    padding: 10px 20px;
  }

  .num {
    float: right;
    font-size: 26px;
    color: #888;
  }

  .card-box__wrapper {
    width: 100%;

    .card-box {
      display: flex;
      flex-direction: row;
    }

    .novel-card {
      max-height: 500px;
      margin: 14px 6px;
      border: 1px solid #ebebeb;
    }
  }
}
</style>