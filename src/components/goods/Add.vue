<template>
  <div>
    <!--导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card>
        <el-alert title="添加商品信息" type="info" center show-icon></el-alert>

      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>


      <!--tab栏-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave='beforeTabLeave' @tab-click='tabClick'>
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>

          <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="catelist" :props="cateProps"
                  @change="handleChange"></el-cascader>
          </el-form-item>

        </el-tab-pane>

        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for="item in manyTabDate" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cd" v-for="(cd ,i) in item.attr_vals" :key="i" border>                 
                </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>


        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTabDate" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>       
        </el-tab-pane>

        <el-tab-pane label="商品图片" name="3">
          <el-upload :action="uoLoadUrl" :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList"
          list-type="picture" :headers="headerObj" :on-success='handleSuccess'>
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
        </el-tab-pane>


        <el-tab-pane label="商品内容" name="4">
          <!--富文本编辑器-->
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>

          <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    
    </el-card> 

    <!--图片预览-->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" >
          <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      //添加商品表单对象和校验规则
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品分类所属分类
        goods_cat: [],
        //图片数组
        pics: [],
        //商品描述信息
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //商品分类数据
      catelist: [],
      //级联选择器
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //动态参数列表数据,静态属性列表
      manyTabDate: [],
      onlyTabDate: [],
      uoLoadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件headers,需要绑定请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }

      this.$message.success('获取商品分类数据成功')
      this.catelist = res.data
    },
    //级联选择器发生变化，触发此函数
    handleChange() {
      if(this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //级联选择器,阻止tab切换
    beforeTabLeave(activeName, oldActiveName) {
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    //tab切换触发函数
    async tabClick() {
      //访问的是动态参数面板
      if(this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
      
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品动态参数失败')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTabDate = res.data
        }else if(this.activeIndex === '2' ) {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
      
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品静态属性失败')
        }

        this.onlyTabDate = res.data
      }
    },
    //处理图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url

      this.previewVisible = true
    },
    //删除图片
    handleRemove(file) {
      const filePath = file.response.data.tmp_path

      //找到图片路径和在数组中的索引
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)

      this.addForm.pics.splice(index, 1)
    },
    //监听图片上传成功
    handleSuccess(response) {
      //得到图片信息对象
      const picInfo = {pic: response.data.tmp_path}

      this.addForm.pics.push(picInfo)
    },
    //添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          return this.$message.error('请填写完整必要表单项')
        }

        //执行添加业务逻辑
        //深拷贝 lodash
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        //处理动态参数和静态属性
        this.manyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join('') //切换成字符串
          }
          this.addForm.attrs.push(newInfo)
        })

        this.onlyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })

        form.attrs = this.addForm.attrs

        //添加商品，必须唯一
        const {data: res} = await this.$http.post('goods', form)
      
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }

        this.$message.success('添加商品成功')
        this.$router.push('/goods')
        })
    }
  },
  computed: {
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    } 
  }
}
</script>

<style lang='less' scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important
}

.previewImg{
  width: 100%;
}

.btnAdd{
  margin-top: 15px;
}
</style>