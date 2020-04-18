<template>
  <div class="setting">
    <van-cell center title="R-18作品显示" label="包含裸露内容或性描写">
      <template #right-icon>
        <van-switch :value="currentSETTING.r18" @input="onR18Change($event, 1)" size="24" />
      </template>
    </van-cell>
    <van-cell center title="R-18G作品显示" label="包含血腥或恶心内容">
      <template #right-icon>
        <van-switch :value="currentSETTING.r18g" @input="onR18Change($event, 2)" size="24" />
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
        r18: false,
        r18g: false
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
    onR18Change(checked, type) {
      let name;
      if (type === 1) name = "R-18";
      if (type === 2) name = "R-18G";

      if (checked) {
        Dialog.confirm({
          message: `确定要开启${name}作品显示吗？请确保您的年龄已满18岁，且未违反当地法律法规所规定的内容`,
          confirmButtonColor: "black",
          cancelButtonColor: "#1989fa",
          closeOnPopstate: true
        })
          .then(() => {
            if (type === 1) this.currentSETTING.r18 = checked;
            if (type === 2) {
              this.currentSETTING.r18g = checked;
              setTimeout(() => {
                Dialog.alert({
                  message: `请注意，开启${name}开关可能会对您的身心健康造成不可逆的影响，如若感到不适，请立即关闭应用并寻求医学帮助`
                });
              }, 200);
            }
          })
          .catch(() => {
            console.log("操作取消");
          });
      } else {
        if (type === 1) this.currentSETTING.r18 = checked;
        if (type === 2) this.currentSETTING.r18g = checked;
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
  height: 110vh;
}
</style>