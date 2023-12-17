<template>
  <div @click.stop="click(artwork.id)" class="novel-card">
    <div class="image-wrap">
      <van-tag
        class="tag-r18"
        round
        :color="tagText === 'R-18' ? '#fb7299' : '#ff3f3f'"
        v-if="tagText"
        >{{ tagText }}</van-tag
      >
      <img
        v-lazy="artwork.images.m"
        :alt="artwork.title"
        class="image"
        :class="{ censored: isCensored(artwork) }"
      />
    </div>
    <div class="meta">
      <div class="title__wrapper">
        <h4 class="series-title">{{ artwork.series.title }}</h4>
        <h2 class="title">{{ artwork.title }}</h2>
      </div>
      <div class="info-box">
        <span class="info words">
          <Icon name="novel" class="icon" scale="1.1"></Icon
          >{{ artwork.text_length.toLocaleString("en-US") }}字
        </span>
        <span class="info like">
          <Icon name="like" class="icon"></Icon>
          {{ artwork.total_bookmarks }}
        </span>
      </div>
      <div class="tag-box">
        <span class="tag" v-for="tag in artwork.tags" :key="tag.name"
          >#{{ tag.name }}</span
        >
      </div>
      <div class="author__wrapper">
        <img
          :src="artwork.author.avatar"
          :alt="artwork.author.name"
          class="avatar"
        />
        <div class="author">{{ artwork.author.name }}</div>
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
      required: true,
    },
    mode: {
      type: String,
      required: false,
      default: "cover",
    },
    column: {
      type: Number,
      required: false,
      default: 2,
    },
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
    ...mapGetters(["isCensored"]),
  },
  methods: {
    click(id) {
      if (
        !id ||
        (this.$route.name === "Artwork" && +this.$route.params.id === id)
      )
        return false;

      this.$emit("click-card", id);
    },
  },
  components: {
    [Tag.name]: Tag,
  },
};
</script>

<style lang="stylus" scoped>
.novel-card {
  position: relative;
  display: flex;
  align-items: center;
  height: 220px;
  overflow: hidden;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;

  .image-wrap {
    flex: none;
    width: 190px;
    height: 220px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      .image {
        transform: scale(1.05);
      }
    }

    .tag-r18 {
      position: absolute;
      top: 8px;
      left: 6px;
      font-size: 20px;
      padding: 2px 8px;
      z-index: 10;
    }

    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform-origin: center;
      transition: transform 0.2s ease-in-out;

      &[lazy='loading'] {
        width: 100px;
        height: 100px;
      }
    }
  }

  .meta {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(100% - 190px);
    padding: 12px 14px;
    box-sizing: border-box;
    color: #444;

    .series-title {
      font-size: 20px;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #666;
    }

    .title {
      font-size: 24px;
      // margin: 10px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: #444;
    }

    .info-box {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 20px;
      color: #666;

      .info {
        margin-right: 12px;
      }
    }

    .tag-box {
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      -webkit-box-orient: vertical;

      .tag {
        display: inline-block;
        margin-right: 10px;
        font-size: 20px;
        color: #0096fa;
      }
    }

    .author__wrapper {
      color: #444;
      margin-top: auto;

      .avatar {
        width: 28px;
        height: 28px;
        margin-right: 4px;
        vertical-align: bottom;
        border-radius: 50%;
        overflow: hidden;
      }

      .author {
        display: inline-block;
        font-size: 20px;
        font-weight: 200;
      }
    }
  }
}
</style>