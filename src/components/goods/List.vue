<template>
  <div>
    <!--导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
             <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>


    </el-card>

    <!--table表格区-->
    <el-table :data="goodslist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格（元）" prop="goods_price" width="95px"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight" width="95px"></el-table-column>
      <el-table-column label="创建时间" prop="add_time" width="140px">
        <template slot-scope="scope">
          {{ scope.row.add_time | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit"></el-button>
          <el-button type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>

    </el-table>

    <!--分页区-->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 40]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total" background>
    </el-pagination>









  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品列表
      goodslist: [],
      //总数据条数
      total: 0

    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //获取商品列表
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods', {params:this.queryInfo})
      
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      this.$message.success('获取商品列表成功')
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    //改变页面
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },
    //删除商品
    async removeById(id) {

      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }
      ).catch(err => err)

      if(confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const {data: res} = await this.$http.delete(`goods/${id}`)
      
      if(res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }

      this.$message.success('删除成功')
      this.getGoodsList()
    },
    //跳转路由
    goAddpage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>

</style>