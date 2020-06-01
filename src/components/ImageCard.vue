<template>
  <div
    @click.stop="click(artwork.id)"
    class="image-card"
    :style="{height: `${(375/artwork.width*artwork.height/column).toFixed(2)}px`}"
  >
    <img
      v-lazy="artwork.images[0].m"
      :alt="artwork.title"
      class="image"
      :class="{censored: isCensored(artwork)}"
    />
    <van-tag
      class="tag-r18"
      round
      :color="tagText==='R-18'?'#fb7299':'#ff3f3f'"
      v-if="tagText"
    >{{tagText}}</van-tag>
    <div class="layer-num" v-if="mode==='cover' && artwork.count>1">
      <Icon name="layer" scale="1.5"></Icon>
      {{artwork.count}}
    </div>
    <Icon class="btn-play" name="play" scale="8" v-if="mode==='cover' && artwork.type==='ugoira'"></Icon>
    <div class="meta" v-if="mode==='meta'">
      <div class="content">
        <h2 class="title">{{artwork.title}}</h2>
        <img :src="artwork.author.avatar" :alt="artwork.author.name" class="avatar" />
        <div class="author">{{artwork.author.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Tag } from "vant";
import { mapGetters } from "vuex";
export default {
  data() {
    return {};
  },
  props: {
    artwork: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: false,
      default: "cover"
    },
    column: {
      type: Number,
      required: false,
      default: 2
    }
  },
  computed: {
    tagText() {
      if (this.artwork.x_restrict === 1) {
        return "R-18";
      } else if (this.artwork.x_restrict === 2) {
        return "R-18G";
      } else {
        return false;
      }
    },
    ...mapGetters(["isCensored"])
  },
  methods: {
    click(id) {
      if (
        !id ||
        (this.$route.name === "Artwork" && +this.$route.params.id === id)
      )
        return false;

      this.$emit("click-card", id);
    }
  },
  components: {
    [Tag.name]: Tag
  }
};
</script>

<style lang="stylus" scoped>
.image-card {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #fafafa;

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &[lazy='loading'] {
      width: 100px;
      height: 100px;
    }
  }

  .tag-r18 {
    position: absolute;
    top: 8px;
    left: 6px;
  }

  .layer-num {
    position: absolute;
    top: 4px;
    right: 3px;
    background: rgba(#000, 0.3);
    color: #fff;
    padding: 4px 8px;
    font-size: 20px;
    border-radius: 20px;

    svg {
      vertical-align: bottom;
      margin-right: -2px;
    }
  }

  .btn-play {
    position: absolute;
    color: #565656;
    opacity: 0.6;
  }

  .meta {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    &::before {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
    }

    .content {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 18px 14px;
      box-sizing: border-box;
      color: #fff;

      .title {
        font-size: 34px;
        margin: 10px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .avatar {
        width: 48px;
        height: 48px;
        margin-right: 8px;
        vertical-align: bottom;
        border-radius: 50%;
        overflow: hidden;
      }

      .author {
        display: inline-block;
        font-size: 30px;
        font-weight: 200;
      }
    }
  }
}
</style>