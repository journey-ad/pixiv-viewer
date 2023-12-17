<template>
  <div class="illusts">
    <van-cell
      class="cell"
      :border="false"
      is-link
      @click="onClick()"
      v-if="once"
    >
      <template #title>
        <span class="title">
          插画作品
          <span class="num" v-if="num">{{ num }}件作品</span>
        </span>
      </template>
    </van-cell>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="!once ? '没有更多了' : ''"
      :error.sync="error"
      error-text="网络异常，点击重新加载"
      @load="getMemberArtwork()"
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
              name: 'Artwork',
              params: { id: art.id, list: artList },
            }"
            v-for="art in artList"
            :key="art.id"
          >
            <ImageCard mode="title" :artwork="art" />
          </router-link>
        </waterfall>
      </div>
    </van-list>
  </div>
</template>

<script>
import { Cell, Swipe, SwipeItem, Icon, List, PullRefresh } from "vant";
import ImageCard from "@/components/ImageCard";
import api from "@/api";
import _ from "lodash";
export default {
  name: "AuthorIllusts",
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
      col: 2,
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
    getMemberArtwork: _.throttle(async function () {
      if (!this.id) return;
      let newList;
      let res = await api.getMemberArtwork(this.id, this.curPage);
      if (res.status === 0) {
        if (res.finished) return (this.finished = true);

        newList = res.data;
        if (this.once) newList = newList.slice(0, 10);
        let artList = JSON.parse(JSON.stringify(this.artList));

        artList.push(...newList);
        artList = _.uniqBy(artList, "id");

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
      const clientWidth = document.documentElement.clientWidth;

      if (clientWidth < 375) {
        this.col = 1;
      } else if (clientWidth <= 768) {
        this.col = 2;
      } else if (clientWidth <= 1600) {
        this.col = 3;
      } else {
        this.col = 4;
      }

      this.itemWidth = Math.floor(
        this.$refs.cardBox.firstChild.clientWidth / this.col
      );
    },
  },
  mounted() {
    this.reset();
    this.getMemberArtwork();
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
    ImageCard,
  },
};
</script>

<style lang="stylus" scoped>
.illusts {
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

    .image-card {
      max-height: 500px;
      margin: 14px 6px;
      border: 1px solid #ebebeb;
    }
  }
}
</style>