<template>
  <div class="artwork">
    <TopBar />
    <div v-if="artwork">
      <ImageView
        :artwork="artwork"
        :lazy="true"
        @open-download="ugoiraDownloadPanelShow = true"
        ref="imgView"
      />
      <van-skeleton
        class="skeleton"
        avatar
        :row="3"
        :avatar-size="'42px'"
        :loading="loading"
      >
        <Meta :artwork="artwork" />
      </van-skeleton>
      <van-divider />
      <keep-alive>
        <AuthorCard
          v-if="artwork.author"
          :id="artwork.author.id"
          :key="artwork.id"
        />
      </keep-alive>
      <van-divider />
      <keep-alive>
        <Related :artwork="artwork" :key="artwork.id" />
      </keep-alive>
    </div>
    <van-action-sheet
      v-model="ugoiraDownloadPanelShow"
      :actions="ugoiraDownloadPanelActions"
      @select="onUgoiraDownloadPanelSelect"
      cancel-text="取消"
      description="请选择下载格式"
      close-on-popstate
      close-on-click-action
    />
  </div>
</template>

<script>
import TopBar from "@/components/TopBar";
import ImageView from "./components/ImageView";
import Meta from "./components/Meta";
import AuthorCard from "./components/AuthorCard";
import Related from "./components/Related";
import { Divider, Skeleton, ActionSheet } from "vant";
import { mapGetters, mapState } from "vuex";
import api from "@/api";
export default {
  name: "Artwork",
  watch: {
    $route() {
      if (
        this.$route.name === "Artwork" &&
        this.$route.params.id !== this.artwork.id
      ) {
        this.init();
      }
    },
  },
  data() {
    return {
      loading: false,
      artwork: {},
      options: {
        // watchOverflow: true,
        // autoHeight: true,
        // slidesPerView: 1,
        // currentPage: 1,
        loop: true,
        thresholdTime: 5000,
        thresholdDistance: 150,
      },
      ugoiraDownloadPanelShow: false,
      ugoiraDownloadPanelActions: [
        { name: "ZIP", subname: "原始序列帧归档文件" },
        { name: "GIF", subname: "低画质，兼容性最佳" },
        { name: "WebM", subname: "高画质，兼容性差" }, // chrome only
      ],
    };
  },
  computed: {
    ...mapState(["galleryList", "currentIndex", "$swiper"]),
    ...mapGetters(["currentId", "isCensored"]),
  },
  methods: {
    init() {
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      this.loading = true;
      let id = +this.$route.params.id;
      this.artwork = {};
      this.getArtwork(id);

      if(this.$route.length > 2) {
        
      }
    },
    async getArtwork(id) {
      // console.log(id);
      let res = await api.getArtwork(id);
      if (res.status === 0) {
        this.artwork = res.data;
        this.loading = false;

        if (this.isCensored(this.artwork)) {
          this.$toast({
            message: "根据当前设置，此内容将不予显示",
            icon: require("@/svg/ban-view.svg"),
          });
          setTimeout(() => {
            // this.$router.back();
          }, 5000);
        }
      } else {
        this.$toast({
          message: res.msg,
          icon: require("@/svg/error.svg"),
        });
        setTimeout(() => {
          this.$router.back();
        }, 500);
      }
    },
    onUgoiraDownloadPanelSelect(item) {
      this.$refs.imgView.download(item.name);
    },
  },
  mounted() {
    this.init();
  },
  updated() {},
  components: {
    TopBar,
    ImageView,
    Meta,
    AuthorCard,
    Related,
    [Divider.name]: Divider,
    [Skeleton.name]: Skeleton,
    [ActionSheet.name]: ActionSheet,
  },
};
</script>

<style lang="stylus" scoped>
.artwork {
  .skeleton {
    margin: 30px 0;
  }
}
</style>