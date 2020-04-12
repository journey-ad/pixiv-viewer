<template>
  <div class="artwork">
    <TopBar />
    <div class="artwork-swipe">
      <div class="artwork-slide left" v-if="galleryList[currentIndex-1]">
        <ImageView :artwork="galleryList[currentIndex-1]" />
        <Meta :artwork="galleryList[currentIndex-1]" />
        <van-divider />
        <AuthorCard
          v-if="galleryList[currentIndex-1].author"
          :id="galleryList[currentIndex-1].author.id"
        />
      </div>
      <div class="artwork-slide" v-if="galleryList[currentIndex]">
        <ImageView :artwork="galleryList[currentIndex]" />
        <Meta :artwork="galleryList[currentIndex]" />
        <van-divider />
        <AuthorCard
          v-if="galleryList[currentIndex].author"
          :id="galleryList[currentIndex].author.id"
        />
      </div>
      <div class="artwork-slide right" v-if="galleryList[currentIndex+1]">
        <ImageView :artwork="galleryList[currentIndex+1]" />
        <Meta :artwork="galleryList[currentIndex+1]" />
        <van-divider />
        <AuthorCard
          v-if="galleryList[currentIndex+1].author"
          :id="galleryList[currentIndex+1].author.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from "@/components/TopBar";
import ImageView from "./components/ImageView";
import Meta from "./components/Meta";
import AuthorCard from "./components/AuthorCard";
import { Divider } from "vant";
import { mapGetters, mapActions, mapState } from "vuex";
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
      artwork: {},
      swiperOptions: {
        watchOverflow: true,
        autoHeight: true,
        slidesPerView: 1,
        initialSlide: 1,
        loop: true
      }
    };
  },
  computed: {
    ...mapState(["galleryList", "currentIndex", "$swiper"]),
    ...mapGetters(["currentId"])
  },
  methods: {
    init() {
      let artworkList = this.$route.params.list,
        id = +this.$route.params.id;
      if (!artworkList) {
        // this.artwork = {};
        this.getArtwork(id);
      } else {
        console.log("====================================");
        console.log(artworkList);
        console.log("====================================");

        this.setGalleryList({
          list: artworkList,
          id
        });
        // this.setSwiper(this.$refs.gallery.$swiper);
        // this.$swiper.slideTo(this.currentIndex);
      }
    },
    async getArtwork(id) {
      // console.log(id);
      let res = await api.getArtwork(id);
      if (res.status === 0) {
        // this.artwork = res.data;
        this.setGalleryList({ list: [res.data], id });
        // this.setSwiper(this.$refs.gallery.$swiper);
      } else {
        this.$toast({
          message: res.msg,
          icon: require("@/svg/error.svg")
        });
        setTimeout(() => {
          this.$router.back();
        }, 500);
      }
    },
    ...mapActions(["setGalleryList", "setCurrentIndex", "setSwiper"])
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
    [Divider.name]: Divider
  }
};
</script>

<style lang="stylus" scoped>
.artwork {
  .artwork-swipe {
    position: relative;
    width: 300vw;
    height: 100vh;

    .artwork-slide {
      position: absolute;
      top: 0;
      width: 100vw;
      height: 100vh;
      overflow: scroll;

      &.left {
        transform: translateX(-100%);
      }

      &.right {
        transform: translateX(100%);
      }
    }
  }
}
</style>