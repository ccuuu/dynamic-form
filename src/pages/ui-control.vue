<template>
  <div>
    <el-form ref="form" :model="form" label-width="90px">
      <el-form-item label="Form label:">
        <el-input v-model="form.label" class="input-with-sele ct">
          <template v-slot:prepend>
            <div v-if="form.labelLeft">
              <i :class="form.labelLeft"></i>
              <i
                class="el-icon-close "
                style="margin-left:5px;display: inline-block;margin-right: -14px;"
                @click="form.labelLeft = null"
              ></i>
            </div>
            <el-select v-else v-model="form.labelLeft">
              <el-option value="el-icon-edit">
                <i class="el-icon-edit"></i>
              </el-option>
              <el-option value="el-icon-share">
                <i class="el-icon-share"></i>
              </el-option>
              <el-option value="el-icon-delete">
                <i class="el-icon-delete"></i>
              </el-option>
            </el-select>
          </template>
          <template v-slot:append>
            <div v-if="form.labelRight">
              <i :class="form.labelRight"></i>
              <i
                class="el-icon-close "
                style="margin-left:5px;display: inline-block;margin-right: -14px;"
                @click="form.labelRight = null"
              ></i>
            </div>
            <el-select v-else v-model="form.labelRight">
              <el-option value="el-icon-edit">
                <i class="el-icon-edit"></i>
              </el-option>
              <el-option value="el-icon-share">
                <i class="el-icon-share"></i>
              </el-option>
              <el-option value="el-icon-delete">
                <i class="el-icon-delete"></i>
              </el-option>
            </el-select>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <draggable-section
      @addElement="$emit('addElement', $event)"
      :form="form"
    ></draggable-section>
  </div>
</template>
<script>
import DraggableSection from './draggable-section.vue'

export default {
  name: 'controls',
  components: { DraggableSection },
  data() {
    return {}
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
}
</script>
<style scoped></style>
