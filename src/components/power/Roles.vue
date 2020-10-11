<template>
  <div>

    <!--角色导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>

      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表-->
      <el-table :data='rolelist' border stripe>

        <el-table-column type='expand'>
          <template slot-scope="scope">
              <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
               v-for="(item1, index1) in scope.row.children" :key='item1.id'>
                <!--渲染权限列表-->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>     
                  <i class="el-icon-caret-right"></i>             
                </el-col>

                <el-col :span="19">
                  <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter' ]" 
                  v-for="(item2, index2) in item1.children" :key='item2.id'>
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>  
                      <i class="el-icon-caret-right"></i>  
                    </el-col>     

                    <el-col :span="18">
                      <el-tag v-for="(item3, index3) in item2.children" 
                      :key='item3.id' type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>  
                    </el-col>

                  </el-row>

                </el-col>

              </el-row>
          </template>
        </el-table-column>

        <el-table-column type='index'></el-table-column>
        <el-table-column label='角色名称' prop='roleName'></el-table-column>
        <el-table-column label='角色描述' prop='roleDesc'></el-table-column>
        <el-table-column label='操作'>
          <template slot-scope="scope">
            <el-button size='mini' type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size='mini' type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size='mini' type="warning" icon="el-icon-setting" 
            @click="showSetRightDialog(scope.row)">分配权限</el-button>

          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--分配权限对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close='setRightDialogClosed'>
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id"
        :default-checked-keys='defKeys' ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制分配权限对话框显示和隐藏
      setRightDialogVisible: false,
      //权限数据列表
      rightslist: [],
      //树形控件绑定对象
      treeProps: {
        label: 'authName',
        children: 'children' 
      },
      //默认选中权限
      defKeys: [],
      //选中权限的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //发送请求，所有角色列表数据
    async getRolesList() {
      const {data: res} = await this.$http.get('roles')

      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.rolelist = res.data 
    },
    //发送请求，删除权限列表数据
    async removeRightById(role, rightId) {

      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }

      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
    
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      
      role.children = res.data

    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限数据
      const {data: res} = await this.$http.get('rights/tree')
      
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightslist = res.data

      //递归获取三级结点的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    //定义默认权限递归函数
    getLeafKeys(node, arr) {
      //如果结点不包含children属性，则为三级结点，加入数组中
      if(!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach( item => 
      this.getLeafKeys(item, arr))

    },
    //监听分配权限对话框关闭
    setRightDialogClosed() {
      this.defKeys = []
    },
    //调用element中tree组件函数，把id传入数组，在用...组合成完整数组
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      
      if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>


<style lang='less' scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-top: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>