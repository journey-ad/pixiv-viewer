<template>
  <div class="artwork">
    <TopBar />
    <div v-if="artwork">
      <ImageView :artwork="artwork" :lazy="true" />
      <van-skeleton class="skeleton" avatar :row="3" :avatar-size="'42px'" :loading="loading">
        <Meta :artwork="artwork" />
      </van-skeleton>
      <van-divider />
      <keep-alive>
        <AuthorCard v-if="artwork.author" :id="artwork.author.id" :key="artwork.id" />
      </keep-alive>
      <van-divider />
      <keep-alive>
        <Related :artwork="artwork" :key="artwork.id" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import TopBar from "@/components/TopBar";
import ImageView from "./components/ImageView";
import Meta from "./components/Meta";
import AuthorCard from "./components/AuthorCard";
import Related from "./components/Related";
import { Divider, Skeleton } from "vant";
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
    }
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
        thresholdDistance: 150
      }
    };
  },
  computed: {
    ...mapState(["galleryList", "currentIndex", "$swiper"]),
    ...mapGetters(["currentId", "isCensored"])
  },
  methods: {
    init() {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.loading = true;
      let id = +this.$route.params.id;
      this.artwork = {};
      this.getArtwork(id);
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
            icon: require("@/svg/ban-view.svg")
          });
          setTimeout(() => {
            // this.$router.back();
          }, 5000);
        }
      } else {
        this.$toast({
          message: res.msg,
          icon: require("@/svg/error.svg")
        });
        setTimeout(() => {
          this.$router.back();
        }, 500);
      }
    }
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
    [Skeleton.name]: Skeleton
  }
};
</script>

<style lang="stylus" scoped>
.artwork {
  .skeleton {
    margin: 30px 0;
  }
}
</style>