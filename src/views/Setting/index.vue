<template>
  <div class="setting">
    <van-cell center title="开启R-18作品显示">
      <template #right-icon>
        <van-switch :value="currentSETTING.r18" @input="onR18Change" size="24" />
      </template>
    </van-cell>
  </div>
</template>

<script>
import { Cell, Switch, Dialog } from "vant";
import { mapState, mapActions } from "vuex";
export default {
  name: "Setting",
  data() {
    return {
      currentSETTING: {
        r18: false
      }
    };
  },
  computed: {
    ...mapState(["SETTING"])
  },
  watch: {
    $route() {
      this.scroll();
    }
  },
  methods: {
    onR18Change(checked) {
      if (checked) {
        Dialog.confirm({
          message:
            "确定要开启R-18作品显示吗？请确保您的年龄已满18岁，且未违反当地法律法规所规定的内容",
          confirmButtonColor: "black",
          cancelButtonColor: "#1989fa",
          closeOnPopstate: true
        })
          .then(() => {
            this.currentSETTING.r18 = checked;
            setTimeout(() => {
              Dialog.alert({
                message:
                  "请注意，开启R-18开关可能会对您的身心健康造成不可逆的影响，如若感到不适，请立即关闭应用并寻求医学帮助"
              });
            }, 200);
          })
          .catch(() => {
            console.log("操作取消");
          });
      } else {
        this.currentSETTING.r18 = checked;
      }
    },
    scroll() {
      let el = document.querySelector(".app-main");
      el.scrollTo({
        top: el.clientHeight,
        left: 0
      });
    },
    ...mapActions(["saveSETTING"])
  },
  mounted() {
    this.currentSETTING = JSON.parse(JSON.stringify(this.SETTING));
    this.scroll();
  },
  updated() {
    this.saveSETTING(JSON.parse(JSON.stringify(this.currentSETTING)));
  },
  components: {
    [Cell.name]: Cell,
    [Switch.name]: Switch
  }
};
</script>

<style lang="stylus" scoped>
.setting {
  height: 100vh;
}
</style>