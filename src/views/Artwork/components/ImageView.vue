<template>
  <div class="image-view" :class="{shrink:isShrink}" @click="showFull" ref="view">
    <div class="image-box" v-for="(url, index) in artwork.images" :key="index">
      <!-- :style="{height: `${(375/artwork.width*artwork.height).toFixed(2)}px`}" -->
      <img
        v-if="lazy"
        v-lazy="url.l"
        :alt="`${artwork.title} - Page ${index+1}`"
        class="image"
        :class="{censored: isCensored(artwork)}"
        @click.stop="view(index, isCensored(artwork))"
      />
      <img
        v-else
        :src="url.l"
        :alt="`${artwork.title} - Page ${index+1}`"
        class="image"
        :class="{censored: isCensored(artwork)}"
        @click.stop="view(index, isCensored(artwork))"
      />
      <canvas
        v-if="artwork.type==='ugoira'"
        class="ugoira"
        :width="artwork.width"
        :height="artwork.height"
        id="ugoira"
        ref="ugoira"
      ></canvas>
    </div>
    <Icon v-if="isShrink" class="dropdown" name="dropdown" scale="4"></Icon>
    <div v-if="artwork.type==='ugoira'" class="ugoira-controls">
      <div v-if="ugoiraPlaying" class="btn-pause" @click="drawCanvas('pause')">
        <Icon class="pause" name="pause" scale="6"></Icon>
      </div>
      <div v-else class="btn-play" @click="playUgoira()">
        <Icon class="play" name="play" scale="6"></Icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { ImagePreview } from "vant";
import axios from "axios";
import JSZip from "jszip";
import api from "@/api";
export default {
  watch: {
    artwork(val) {
      if (val.images && val.images.length > 0) {
        this.init();
      }
    }
  },
  props: {
    artwork: {
      type: Object,
      required: true
    },
    lazy: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    original() {
      return this.artwork.images.map(url => url.o);
    },
    ...mapState(["$swiper"]),
    ...mapGetters(["isCensored"])
  },
  data() {
    return {
      isShrink: false,
      ugoira: null,
      ugoiraPlaying: false,
      curIndex: 0
    };
  },
  methods: {
    view(index, censored) {
      if (censored) {
        this.$toast({
          message: "根据当前设置，此内容将不予显示",
          icon: require("@/svg/ban-view.svg")
        });
      } else {
        if (window.plus) {
          var x = index;
          if (Object.keys(this.original).length == 1) {
            x = 0;
          }
          var obj = [];
          for (var b in this.original) {
            obj.push(this.original[b]);
          }
          plus.nativeUI.previewImage(obj, {
            current: x,
            onLongPress: function(e) {
              // 预览界面长按显示ActionSheet
              var bts = [{ title: "保存至相册" }];
              plus.nativeUI.actionSheet(
                { title: "选择操作", cancel: "取消", buttons: bts },
                function(t) {
                  if (t.index == 1) {
                    //e.url e.path
                    plus.gallery.save(
                      e.url,
                      function() {
                        plus.nativeUI.toast("保存成功");
                      },
                      function() {
                        plus.nativeUI.toast("保存失败");
                      }
                    );
                  }
                }
              );
            }
          });
        } else {
          ImagePreview({
            className: "image-preview",
            images: this.original,
            startPosition: index,
            closeOnPopstate: true
          });
        }
      }
    },
    showFull() {
      if (this.isShrink) this.isShrink = false;
    },
    async ugoiraMetadata() {
      let res = await api.ugoiraMetadata(this.artwork.id);
      if (res.status === 0) {
        return Object.freeze(res.data);
      } else {
        this.$toast({
          message: res.msg
        });
      }
    },
    async playUgoira() {
      if (this.ugoira) {
        this.drawCanvas("play");
        return;
      }

      const ugoira = await this.ugoiraMetadata();
      const frames = {};
      ugoira.frames.forEach(frame => {
        frames[frame.file] = frame;
      });

      this.ugoira = {
        frames,
        zip: ugoira.zip
      };
      // console.log(this.ugoira);
      const resp = await axios.get(ugoira.zip, {
        responseType: "blob"
      });
      // console.log(resp.data);

      const jszip = new JSZip();
      jszip.loadAsync(resp.data).then(zip => {
        let index = 0;
        const files = Object.keys(zip.files);
        files.forEach(name => {
          zip
            .file(name)
            .async("blob")
            .then(blob => {
              // const data = URL.createObjectURL(blob)
              // console.log(data)
              // const array = new Uint8ClampedArray(data);
              // console.log(width * height * 4, array);
              // const imgData = new ImageData(array, width, height);
              index++;

              const imgData = new Image();
              imgData.src = URL.createObjectURL(blob);
              this.ugoira.frames[name].data = imgData;

              if (index === files.length) {
                console.info("动图帧数据加载完成");
                this.$nextTick(() => {
                  this.drawCanvas("play");
                });
              }
            });
        });
      });
    },
    drawCanvas(action) {
      const ctx = this.$refs.ugoira[0].getContext("2d");
      // console.log(ctx);
      const { width, height } = this.artwork;

      const frames = Object.values(this.ugoira.frames);

      let length = frames.length;

      const draw = () => {
        this.curIndex++;
        setTimeout(
          () => {
            if (!this.ugoira || !this.ugoiraPlaying) return;

            // const imgUri = URL.createObjectURL(frames[this.curIndex - 1].data);
            // const imgData = new Image();
            // imgData.onload = () => {
            ctx.drawImage(frames[this.curIndex - 1].data, 0, 0, width, height);

            if (this.curIndex >= length) this.curIndex = 0;
            draw();
            // };
            // imgData.src = imgUri;
          },
          this.curIndex === 0 ? 0 : frames[this.curIndex - 1].delay
        );
      };

      if (action === "play") {
        this.ugoiraPlaying = true;
        draw();
      } else if (action === "pause") {
        this.ugoiraPlaying = false;
      }
    },
    init() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.artwork.images && this.artwork.images.length >= 3) {
            this.isShrink = true;
          } else {
            this.isShrink = false;
          }
        }, 0);
      });
    }
  },
  mounted() {
    this.init();
  },
  deactivated() {
    this.ugoira = null;
    this.ugoiraPlaying = false;
  }
};
</script>

<style lang="stylus" scoped>
.image-view {
  position: relative;
  min-height: 600px;
  background-color: #fafafa;

  &.shrink {
    max-height: 1000px;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: linear-gradient(to top, rgb(255, 255, 255), rgba(#fff, 0));
    }

    .dropdown {
      position: absolute;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
      color: #fafafa;
      filter: drop-shadow(1px 4px 8px rgba(0, 0, 0, 0.2));
      animation: ani-dropdown 2s ease-in-out infinite;
    }

    @keyframes ani-dropdown {
      0%, 100% {
        transform: translate(-50%, 0);
      }

      50% {
        transform: translate(-50%, 6px);
      }
    }
  }

  .image-box {
    position: relative;
    background: #fafafa;
    min-height: 600px;
    max-height: 1000px;

    .image {
      width: 100%;
      height: 100%;
      min-height: 600px;
      max-height: 1000px;
      object-fit: cover;

      &[lazy='loading'] {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        min-height: auto;
      }
    }

    .ugoira {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      // background: #fff;
    }
  }

  .ugoira-controls {
    position: absolute;
    right: 16px;
    bottom: 16px;

    .play, .pause {
      color: rgba(122, 172, 208, 0.9);
    }
  }
}
</style>