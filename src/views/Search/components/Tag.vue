<template>
  <div class="tag">
    <img :src="tag.pic" alt />
    <div class="meta">
      <div class="content">
        <div class="name">#{{tag.name}}</div>
        <div class="tname">{{tag.tname}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="stylus" scoped>
.tag {
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .meta {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    color: #fff;
    background: rgba(#000, 0.3);

    .content {
      position: absolute;
      bottom: 10%;
      width: 100%;

      .name {
        font-size: 36px;
        margin: 10px 0;
      }

      .tname {
        font-size: 28px;
        margin: 10px 0;
      }
    }
  }
}
</style>