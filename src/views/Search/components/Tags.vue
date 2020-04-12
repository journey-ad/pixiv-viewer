<template>
  <div class="tags">
    <div class="top" v-if="tags.length>0">
      <Tag class="tag" :tag="tags[0]" />
    </div>
    <div class="bottom" v-if="tags.length>3">
      <div class="row">
        <Tag :tag="tag" v-for="(tag,index) in handle(1)" :key="index" />
      </div>
      <div class="row">
        <Tag :tag="tag" v-for="(tag,index) in handle(2)" :key="index" />
      </div>
      <div class="row">
        <Tag :tag="tag" v-for="(tag,index) in handle(0)" :key="index" />
      </div>
    </div>
  </div>
</template>

<script>
import Tag from "./Tag";
import api from "@/api";
export default {
  data() {
    return {
      tags: []
    };
  },
  methods: {
    handle(n) {
      return this.tags.slice(1).filter((_, index) => (index + 1) % 3 === n);
    },
    async getTags() {
      let res = await api.getTags();
      if (res.status === 0) {
        this.tags = res.data;
      } else {
        this.$toast({
          message: res.msg
        });
        this.loading = false;
        this.error = true;
      }
    }
  },
  mounted() {
    this.getTags();
  },
  components: {
    Tag
  }
};
</script>

<style lang="stylus" scoped>
.tags {
  display: flex;
  flex-direction: column;

  .top {
    .tag {
      height: 600px;
    }
  }

  .bottom {
    display: flex;

    .row {
      width: 33.33%;

      .tag {
      }
    }
  }
}
</style>