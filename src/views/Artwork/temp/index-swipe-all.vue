<template>
  <div class="artwork">
    <TopBar />
    <div class="artwork-swipe" ref="slider" :options="options" @slide="slide">
      <div class="swipe-wrap">
        <div class="artwork-slide" v-for="artwork in galleryList" :key="artwork.id">
          <ImageView :artwork="artwork" :lazy="false" />
          <Meta :artwork="artwork" />
          <van-divider />
          <AuthorCard v-if="artwork.author" :id="artwork.author.id" />
        </div>
      </div>
    </div>
    <div class="off-screen">
      <div class="artwork-slide slider-before" v-if="galleryList[currentIndex-1]">
        <ImageView :artwork="galleryList[currentIndex-1]" :lazy="false" />
        <Meta :artwork="galleryList[currentIndex-1]" />
        <van-divider />
        <AuthorCard
          v-if="galleryList[currentIndex-1].author"
          :id="galleryList[currentIndex-1].author.id"
        />
      </div>

      <div class="artwork-slide slider-after" v-if="galleryList[currentIndex+1]">
        <ImageView :artwork="galleryList[currentIndex+1]" :lazy="false" />
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
import { slider, slideritem } from "@/components/vue-concise-slider";
import Swipe from "@/components/swipe";
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
        // this.$nextTick(() => {
        this.$swipe ? this.$swipe.setup() : this.initSwipe();
        this.$swipe.slide(this.currentIndex, 0);
        // });
      }
    },
    async getArtwork(id) {
      // console.log(id);
      let res = await api.getArtwork(id);
      if (res.status === 0) {
        // this.artwork = res.data;
        this.setGalleryList({ list: [res.data], id });
        // this.setSwiper(this.$refs.gallery.$swiper);
        this.$nextTick(() => {
          this.$swipe ? this.$swipe.setup() : this.initSwipe();
        });
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
    initSwipe() {
      const me = this;
      let element = this.$refs.slider;
      let $swipe = new Swipe(element, {
        startSlide: 0,
        draggable: true,
        autoRestart: false,
        continuous: true,
        disableScroll: false,
        stopPropagation: true,
        callback: function(index, element) {
          // console.log(index, element);
        },
        transitionEnd: function(index, element) {
          // console.log(index, element);
          console.log(me.currentIndex, index);
          if (!me.galleryList[index]) return;

          console.log(me.galleryList[index].id);

          me.setCurrentIndex(me.galleryList[index].id);

          history.replaceState(
            {},
            null,
            `/#/artwork/${me.galleryList[me.currentIndex].id}`
          );
        }
      });
      this.$swipe = $swipe;
    },
    slide(e) {
      // console.log(e);
      let index = e.currentPage;
      console.log(this.currentIndex, index);
      if (index === 0) return;
      if (!this.galleryList[this.currentIndex + index]) return;

      console.log(
        this.galleryList[this.currentIndex].id,
        this.galleryList[this.currentIndex + index].id
      );

      // this.setCurrentIndex(this.galleryList[this.currentIndex + index].id);

      history.replaceState(
        {},
        null,
        `/#/artwork/${this.galleryList[this.currentIndex].id}`
      );
      // if (
      //   this.$route.params.id ===
      //   this.galleryList[this.currentIndex + index].id
      // )
      //   return;
      // this.$router.push({
      //   name: "Artwork",
      //   params: {
      //     id: this.galleryList[this.currentIndex + index].id
      //   }
      // });
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
    // slider,
    // slideritem,
    [Divider.name]: Divider
  }
};
</script>

<style lang="stylus" scoped>
.artwork {
  .artwork-swipe {
    overflow: hidden;
    visibility: hidden;
    position: relative;

    .swipe-wrap {
      overflow: hidden;
      position: relative;
      width: 100%;
      height: 100vh;

      > div {
        float: left;
        width: 100%;
        height: 100%;
        position: relative;
        overflow-y: scroll;
      }

      .artwork-slide {
        width: 100%;
        color: #333;
        white-space: normal;
        text-align: left;
      }

      .slider-copy {
        // max-height: 100vh;
      }
    }
  }

  .off-screen {
    display: none;
  }
}
</style>