<template>
  <div>
    <!--导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

   <!--卡片区-->
    <el-card>

      <el-alert show-icon title="注意：只允许为第三级设置相关参数" type="warning"></el-alert>

      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="catelist" expand-trigger="hover"
            :props="cateProps" @change="handleChanged" >
          </el-cascader>
        </el-col>

      </el-row>

      <!--tab页签区-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDisabled" type="primary" @click="addDialogVisible=true">添加参数</el-button>
           <!--动态参数表格-->
           <el-table :data="mantTabData" border stripe>
               <!--展开行-->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag closable v-for='(item, index) in scope.row.attr_vals' :key='index' @close='handleClose(index, scope.row)'>
                    {{item}}
                  </el-tag>
                  <!--tab输入标签-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"  @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>

              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
           </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">          
          <el-button :disabled="isBtnDisabled" type="primary" @click="addDialogVisible=true">添加属性</el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTabData" border stripe>
              <!--展开行-->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag closable v-for='(item, index) in scope.row.attr_vals' :key='index' @close='handleClose(index, scope.row)'>
                    {{item}}
                  </el-tag>
                  <!--tab输入标签-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"  @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>

              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
           </el-table>
        </el-tab-pane>

      </el-tabs>

    </el-card>

  <!--添加参数对话框-->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%"
      @close='addDialogClosed'>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

  <!--修改参数对话框-->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%"
      @close='editDialogClosed'>

      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>  



  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      catelist: [],
      //级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择框双向绑定数组
      selectedCateKeys: [],
      //被激活的页签名称
      activeName: 'many',
      //动态参数和静态属性的保存
      mantTabData: [],
      onlyTabData: [],
      //控制添加对话框显示和隐藏
      addDialogVisible: false,
      //添加参数表单数据对象
      addForm: {
        attr_name:''
      },
      //添加表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //控制修改对话框显示和隐藏
      editDialogVisible: false,
      //修改参数表单数据对象
      editForm: {},
      //修改表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //tab文本框
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取所有商品分类
    async getCateList() {
      const {data: res} = await this.$http.get('categories')

      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.catelist = res.data
    },
    //级联选择框变化会触发这个函数
    async handleChanged() {
      this.getParamsData()
    },
    //tab页签点击事件处理函数
    async handleTabClick() {
      this.getParamsData()
    },
    //获取参数列表数据
    async getParamsData() {
      //只选择三级分类
      if(this.selectedCateKeys.length !== 3){
        this.selectedCateKeys = []
        this.mantTabData = []
        this.onlyTabData = []
        return
      }

      //根据所选id获取对象属性
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      
      //分割标签
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        //控制文本框
         item.inputVisible = false
         item.inputValue = '' 
      })

      if(this.activeName === 'many') {
        this.mantTabData = res.data
      }else {
        this.onlyTabData = res.data
      }
    },
    //监听对话框关闭事件，重置内容
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
         {attr_name: this.addForm.attr_name, attr_sel: this.activeName})
        
        if(res.meta.status !== 201) {
        return this.$message.error('添加参数失败')       
        }

        this.$message.success('添加参数成功')        
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    //重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.sesetFields()
    },
    //点击按钮，展示修改对话框
    async showEditDialog(attr_id) {
      //查询当前参数信息
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    //点击按钮，修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
         {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
        
        if(res.meta.status !== 200) {
        return this.$message.error('修改参数失败')       
        }

        this.$message.success('修改参数成功')      
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //根据id删除对应参数
    async removeParams(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除')
        }

        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

        if(res.meta.status !== 200) {
        return this.$message.error('删除参数失败')       
        }

        this.$message.success('删除参数成功')      
        this.getParamsData()
    },
    //文本框失去焦点
    async handleInputConfirm(row) {
      if(row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      //如果没有return，则证明输入了
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false    

      this.saveAttrvals(row)
    },
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获得焦点
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
    },
    //抽离更新数据库函数
    async saveAttrvals(row) {
       //发送网络请求，添加数据库
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
       {
         attr_name: row.attr_name,
         attr_sel: row.attr_sel,
         attr_vals: row.attr_vals.join(',')
       })

      if(res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }

      this.$message.success('修改参数成功')
    },
    //删除对应标签可选项
    handleClose(index, row){
      row.attr_vals.splice(index, 1)
      this.saveAttrvals(row)
    }
  },
  computed: {
    //不是三级，不能添加属性
    isBtnDisabled() {
      if(this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //当前选中的三级分类id
    cateId() {
      if(this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }

      return null
    },
    //动态计算标题对话框
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang='less' scoped>
.cat_opt{
  margin-top: 15px;
}

.el-tag{
  margin: 10px;
}

.input-new-tag{
  width: 120px;
}
</style>