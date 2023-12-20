<template>
  <div class="novel-meta" v-if="novel.id">
    <h1 class="novel-title">
      <van-tag
        class="tag"
        round
        :color="tagText === 'R-18' ? '#fb7299' : '#ff3f3f'"
        v-if="tagText"
      >{{ tagText }}</van-tag>
      {{ novel.title }}
    </h1>
    <div class="info-box">
      <router-link
        class="info author"
        :to="{
          name: 'Users',
          params: { id: novel.user.id },
        }"
      >{{ novel.user.name }}</router-link>
      <span class="info words">
        <Icon name="novel" class="icon" scale="1.1"></Icon>
        {{ novel.text_length.toLocaleString("en-US") }}字
      </span>
      <span class="info like">
        <Icon name="like" class="icon"></Icon>
        {{ novel.like.toLocaleString("en-US") }}
      </span>
      <span class="pixiv">
        <a
          :href="`https://www.pixiv.net/novel/show.php?id=${novel.id}`"
          target="_blank"
          rel="noreferrer"
          title="前往Pixiv查看作品"
        >
          <Icon name="pixiv" class="icon"></Icon>
        </a>
      </span>
    </div>
    <div class="tag-box">
      <router-link
        class="tag"
        :to="{
          name: 'Search',
          query: { type: 'novel', keyword: tag.name },
        }"
        v-for="tag in novel.tags"
        :key="tag.name"
      >#{{ tag.name }}</router-link>
    </div>
  </div>
</template>

<script>
import { Tag, Slider } from "vant";

export default {
  name: "NovelMeta",
  props: ["novel"],
  computed: {
    tagText() {
      if (this.novel.x_restrict === 1) {
        return "R-18";
      } else if (this.novel.x_restrict === 2) {
        return "R-18G";
      } else {
        return false;
      }
    },
  },
  components: {
    [Tag.name]: Tag,
  },
};
</script>

<style lang="stylus" scoped>
.novel-meta {
  font-size: 16px;
  font-weight: normal;
  line-height: 1.5;
  color: #1f1f1f;
  background: #e6f1fa;
  border: 2px solid #eaeaea;
  border-radius: 10px;
  padding: 14px 20px;
  margin: 25px auto;
  // max-width: calc(100% - 100px);
  box-shadow: 0px 24px 15px -16px rgba(#000, 0.15);

  .novel-title {
    font-size: 36px;
    line-height: 1.4;
    margin-bottom: 10px;

    .tag {
      font-size: 24px;
    }
  }

  .info-box {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .info {
      display: flex;
      align-items: center;
      margin-right: 14px;
      color: #444;
      font-size: 24px;

      .icon {
        color: #ffcd59;
      }
    }

    .pixiv {
      margin-left: 20px;
      cursor: pointer;

      .icon {
        width: auto;
        height: 28px;
      }
    }
  }

  .tag-box {
    word-break: break-word;

    .tag {
      display: inline-block;
      margin-right: 10px;
      margin-bottom: 4px;
      font-size: 24px;
      color: #0096fa;
    }
  }
}
</style>