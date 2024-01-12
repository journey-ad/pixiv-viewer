<template>
  <div class="setting">
    <van-cell center title="缓存数据" :label="size | bytes">
      <template #right-icon>
        <van-button type="primary" size="small" @click="clearCache('local')"
          >清理</van-button
        >
      </template>
    </van-cell>
    <van-cell center title="R-18作品显示" label="包含裸露内容或性描写">
      <template #right-icon>
        <van-switch
          :value="currentSETTING.r18"
          @input="onR18Change($event, 1)"
          size="24"
        />
      </template>
    </van-cell>
    <van-cell center title="R-18G作品显示" label="包含血腥或恶心内容">
      <template #right-icon>
        <van-switch
          :value="currentSETTING.r18g"
          @input="onR18Change($event, 2)"
          size="24"
        />
      </template>
    </van-cell>
    <van-field
      v-model.trim="currentSETTING.api"
      label="API地址"
      placeholder="填写一个可用的API地址"
    />
    <van-cell
      center
      title="Pixiv Viewer"
      label="https://github.com/journey-ad/pixiv-viewer"
      url="https://github.com/journey-ad/pixiv-viewer"
    ></van-cell>
    <van-cell center title="构建日期" :label="buildDate"></van-cell>
  </div>
</template>

<script>
import { Cell, Switch, Button, Dialog, Field } from "vant";
import { mapState, mapActions } from "vuex";
import { dateFormat } from "@/utils";
import { DBStorage, SessionStorage } from "@/utils/storage";
export default {
  name: "Setting",
  data() {
    return {
      buildDate: dateFormat(__BUILD_TIMESTAMP__, "yyyy-MM-dd"),
      currentSETTING: {
        api: "https://hibiapi.getloli.com/api/",
        r18: false,
        r18g: false,
      },
      size: 0,
    };
  },
  computed: {
    ...mapState(["SETTING"]),
  },
  watch: {
    $route() {
      this.calcCacheSize();
    },
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
          closeOnPopstate: true,
        })
          .then(() => {
            if (type === 1) this.currentSETTING.r18 = checked;
            if (type === 2) {
              this.currentSETTING.r18g = checked;
              setTimeout(() => {
                Dialog.alert({
                  message: `请注意，开启${name}开关可能会对您的身心健康造成不可逆的影响，如若感到不适，请立即关闭应用并寻求医学帮助`,
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
    async calcCacheSize() {
      this.size = await DBStorage.size;
    },
    clearCache(type) {
      Dialog.confirm({
        message: `确定要清理缓存数据吗？清理后将重新从网络加载相关内容`,
        confirmButtonColor: "black",
        cancelButtonColor: "#1989fa",
        closeOnPopstate: true,
      }).then(async () => {
        if (type === "local") await DBStorage.clear();
        if (type === "session") SessionStorage.clear();

        this.calcCacheSize();
        this.$toast.success("清理完成");
      });
    },
    ...mapActions(["saveSETTING"]),
  },
  filters: {
    bytes(bytes) {
      bytes = Number(bytes);
      if (bytes === 0) return "0 B";

      const k = 1024;
      const dm = 0;
      const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
  },
  mounted() {
    this.currentSETTING = Object.assign({}, this.currentSETTING, this.SETTING);
    this.calcCacheSize();
  },
  updated() {
    this.saveSETTING(this.currentSETTING);
  },
  components: {
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Switch.name]: Switch,
    [Field.name]: Field,
  },
};
</script>

<style lang="stylus" scoped>
.setting {
}
</style>