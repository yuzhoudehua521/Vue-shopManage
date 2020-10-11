<template>
  <div>
    <!--导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card >
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格-->
      <tree-table :data='catelist' :columns='columns' :selection-type='false'
      :expand-type='false' show-index border class="treeClass">

        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" 
          style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-else-if='scope.row.cat_level===1'>二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>

      </tree-table>

      <!--分页-->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[4, 6, 8, 10]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    </el-card>

    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close='addCateDialogClosed'>
      <!--添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：" >
          <el-cascader v-model="selectedKeys" :options="parentCateList" expand-trigger="hover"
            :props="cascaderProps" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
     //商品分类数据列表
      catelist:[],
      total: 0,
      //为table指定列的定义
      columns: [
        {
        label: '分类名称',
        prop: 'cat_name'
        },
        //自定义template模板
        {
        label: '是否有效',
        type: 'template',
        template: 'isok',
        },
        {
        label: '排序',
        type: 'template',
        template: 'order',
        },
        {
        label: '操作',
        type: 'template',
        template: 'opt',
        }
      ],
      //添加对话框显示和隐藏
      addCateDialogVisible: false,
      //添加分类表单数据对象
      addCateForm: {
        cat_name:'',
        //父级分类id
        cat_pid: 0,
        cat_level: 0
      },
      //添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //父级分类列表数据
      parentCateList: [],
      //级联选择器配置对象
      cascaderProps: {
        value:'cat_id',
        label:'cat_name',
        children: 'children'
      },
      //选中的父级id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
    
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
     
      this.catelist = res.data.result
      this.total = res.data.total
    },
    //监听页面大小改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击按钮展示添加分类对话框
    showAddCateDialog() {
      //先获取父级分类数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params:{type:2}})

      if(res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }

      this.parentCateList = res.data
    },
    //选择项发生变化触发这个函数
    parentCateChanged() {
      //如果selectedKeys数组中length大于0，则选了父级分类
      if(this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }

    },
    //点击按钮添加新的分类
    addCate() {
      //校验
      this.$refs.addCateFormRef.validate( async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)

        if(res.meta.status !== 201) {
        return this.$message.error('添加分类失败')
        } 

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //监听表单，清空
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang='less' scoped>
.treeClass{
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>