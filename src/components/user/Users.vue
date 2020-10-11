<template>
  <div>
    <!--导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card >
      <el-row :gutter='20'>
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getUserList'>
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type='primary' @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

    <!--用户列表区-->
      <el-table :data='userlist' border stripe>
        <el-table-column type='index'></el-table-column>
         <el-table-column label='姓名' prop='username'></el-table-column>
         <el-table-column label='邮箱' prop='email'></el-table-column>
         <el-table-column label='电话' prop='mobile'></el-table-column>
         <el-table-column label='角色' prop='role_name'></el-table-column>
         <el-table-column label='状态' >
           <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state" @change="userStatusChange(scope.row)">
            </el-switch>
           </template>
         </el-table-column>
         <el-table-column label='操作'>
            <template slot-scope="scope">               
                <el-tooltip effect="dark" content="编辑" placement="bottom" :enterable='false'>
                  <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="bottom" :enterable='false'>
                  <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeUserById(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="分配角色" placement="bottom" :enterable='false'>
                  <el-button type="warning" icon="el-icon-setting" size='mini' @click="setRole(scope.row)"></el-button>
                </el-tooltip>
            </template>
         </el-table-column>
      </el-table>

      <el-pagination
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>

    </el-card>

  <!--添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close='addDialogClose'>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
 
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
    
      </el-form>  

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>


    <!--分配角色对话框-->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close='setRoleDialogClose'>
      <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList" :key="item.id"
                :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
      
 
  </div>
</template>

<script>
export default {
  data() {
      //自定义验证规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/;
      if(regEmail.test(value)) {
        return callback()
      }
      callback( new Error('请输入合法邮箱'))
    }

    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3-9]\d{9}$/;
      if(regMobile.test(value)) {
        return callback()
      }
      callback( new Error('请输入合法手机号'))
    }

    return {
      //获取用户列表参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //控制对话框显示和隐藏
      addDialogVisible: false,
      //控制修改对话框显示和隐藏
      editDialogVisible: false,
      //查询到的用户信息
      editForm: {},
      //修改用户规则
      editFormRules: {
        //修改表单验证规则对象
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加用户表单数据,验证规则
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min:3, max: 10, message:'用户名3到10之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min:6, max: 10, message:'密码6到10之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      //控制分配角色对话框显示和隐藏
      setRoleDialogVisible: false,
      //需要被分配角色用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色id值
      selectedRoleId: ''
    }
  },
  //页面创建期间执行的函数
  created() {
    this.getUserList()
  },
  methods: {
    //重新获取列表数据
    async getUserList() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo});
      if(res.meta.status !== 200) return this.$message.error('获取用户列表失败');
      this.userlist = res.data.users;
      this.total = res.data.total
    },
    //监听分页改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList()
    },
    //监听switch开关状态改变
    async userStatusChange(userinfo) {
      const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
      if(res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更新用户状态失败');
      }  
      this.$message.success('更新用户状态成功')
    },
    //清除添加用户操作
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return;
        const {data: res} = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        } 
        this.$message.success('添加用户成功')
        //隐藏添加对话框,刷新用户列表
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      const {data: res} = await this.$http.get('users/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('查询用户失败');
      }  
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return;
        const {data: res} = await this.$http.put('users/' + this.editForm.id,
        {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })

        if(res.meta.status !== 200) {
          return this.$message.error('更新用户失败');
        }

        //成功后关闭对话框，更新列表数据
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('更新用户成功')
      })
    },
    //根据id删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }
      ).catch(err => {
        return err
      })

      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除');
      }

      const {data: res} = await this.$http.delete('users/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除用户失败');
      }

      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async setRole(userInfo) {
      this.userInfo = userInfo

      //展示对话框之前，获取所有角色列表
      const {data: res} = await this.$http.get('roles')

      if(res.meta.status !== 200) {
        return this.$message.error('更新角色列表失败');
      }

      this.rolesList = res.data

      this.setRoleDialogVisible = true
    },
    //点击按钮分配角色
    async saveRoleInfo() {
      if(!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }

      //根据用户id，更新选择的角色id
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })

      if(res.meta.status !== 200) {
        return this.$message.error('更新角色失败');
      }

      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false

    },
    //监听分配角色对话框关闭事件
    setRoleDialogClose() {
      this.selectedRoleId = '',
      this.userInfo = {}
    }
  }
}
</script>

<style lang='less' scoped>

</style>