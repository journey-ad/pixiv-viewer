<template>
  <div class="image-slide">
    <div class="slide">
      <img
        :src="image.src"
        :alt="image.title"
        v-for="(image,index) in images"
        :key="index"
        class="image"
        :class="{censored: image.isCensored}"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    images: {
      type: Array,
      required: false
    }
  }
};
</script>

<style lang="stylus" scoped>
.image-slide {
  position: relative;
  height: 100%;
  overflow: hidden;

  .slide {
    display: flex;
    height: 100%;
    width: 110%;
    margin-left: -8%;
    display: flex;

    .image {
      width: 26%;
      object-fit: cover;
      clip-path: polygon(25% 0, 100% 0, 75% 100%, 0% 100%);
      margin-right: -6%;
    }
  }
}
</style>