<!-- <template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">欢迎使用</h3>
      </div>

      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="userName" v-model="loginForm.userName" placeholder="邮箱" name="userName" type="text" tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width: 100%; margin-bottom: 30px" @click.native.prevent="handleLogin">登录</el-button>

      <p class="tips">
        <a href="./register/index.vue" type="primary">还没有帐号？立即注册</a>
      </p>
    </el-form>
  </div>
</template> -->

<template>
  <div class="login">
    <div class="mylogin" align="center">
      <h4>登录</h4>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="0px">
        <el-form-item label="" prop="account" style="margin-top: 10px">
          <el-row>
            <el-col :span="2">
              <span class="el-icon-s-custom"></span>
            </el-col>
            <el-col :span="22">
              <el-input class="inps" placeholder="账号" v-model="loginForm.account"> </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="" prop="passWord">
          <el-row>
            <el-col :span="2">
              <span class="el-icon-lock"></span>
            </el-col>
            <el-col :span="22">
              <el-input class="inps" type="password" autocomplete="new-password" placeholder="密码" v-model="loginForm.passWord"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item style="margin-top: 55px">
          <el-button type="primary" round class="submitBtn" @click="submitForm">登录 </el-button>
        </el-form-item>
        <div class="unlogin">
          <router-link :to="{ path: '/forgetpwd' }"> 忘记密码? </router-link>
          |
          <router-link :to="{ path: '/register' }">
            <a href="./register/index.vue" target="_blank" align="right">注册新账号</a>
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import { LOGIN_URL } from '../../constants/API'
import { mapMutations } from 'vuex'
export default {
  name: 'Login',
  data() {
    return {
      username: 'admin',
      password: '123456',
      loginForm: {
        userName: '',
        account: '',
        passWord: ''
      },
      loginRules: {
        // userName: [{ type: 'email', required: true, trigger: 'blur', message: '请输入邮箱' }],
        // password: [
        //   {
        //     required: true,
        //     message: '创建密码',
        //     trigger: 'blur'
        //   },
        //   { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, message: '密码必须同时包含数字与字母,且长度为 8-20位' }
        // ]
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        passWord: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      formData: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['changeLogin']),
    submitForm() {
      const userAccount = this.loginForm.account
      const userPassword = this.loginForm.passWord
      if (!userAccount) {
        return this.$message({
          type: 'error',
          message: '账号不能为空！'
        })
      }
      if (!userPassword) {
        return this.$message({
          type: 'error',
          message: '密码不能为空！'
        })
      }
      console.log('用户输入的账号为：', userAccount)
      console.log('用户输入的密码为：', userPassword)
      this.$router.push({ path: this.redirect || '/home' })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleSubmit() {
      const that = this
      const req = {
        username: this.username,
        password: this.password
      }
      this.$ajax.post(LOGIN_URL, req).then((res) => {
        console.log(res)
        const code = res.code
        if (code === '000') {
          that.logining = false
          const token = res.data.token
          const orgCode = res.data.orgCode

          sessionStorage.setItem('orgCode', orgCode)
        } else {
          // that.$alert('用户名或密码错误！','error',{
          //   confirmButtonText:'ok'
          // })
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
.login {
    width: 100vw;
    padding: 0;
    margin: 0;
    height: 100vh;
    font-size: 16px;
    background-position: left top;
    background-color: #242645;
    color: #fff;
    font-family: "Source Sans Pro";
    position: relative;
  }

  .mylogin {
    width: 240px;
    height: 280px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    padding: 50px 40px 40px 40px;
    box-shadow: -15px 15px 15px rgba(6, 17, 47, 0.7);
    opacity: 1;
    background: linear-gradient(
      230deg,
      rgba(53, 57, 74, 0) 0%,
      rgb(0, 0, 0) 100%
    );
  }

  .inps input {
    border: none;
    // color: #fff;
    background-color: transparent;
    font-size: 12px;
  }

  .submitBtn {
    background-color: transparent;
    color: #39f;
    width: 200px;
  }
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    float: right;
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>

<style scoped>
/* 修改验证器样式 */
::v-deep .el-form-item.is-error .el-input__inner {
  border-color: #889aa4;
}
::v-deep .el-form-item.is-error .el-input__validateIcon {
  color: #889aa4;
}
::v-deep .el-form-item__error {
  color: #e6a23c;
}
</style>
