<template>
  <el-button @click="handleSave" type="primary">save</el-button>
  <el-button @click="handleClear" type="primary">clear</el-button>
  <el-button @click="handleCopyRaw" type="primary">copy raw</el-button>
  <el-button>send to email (not done)</el-button>
  <el-button>export to pdf (not done)</el-button>

  <div class="minuteDetailContainer">
    <el-form :model="minuteDetailForm" label-width="120px">
      <el-form-item label="Project Title">
        <el-input v-model="minuteDetailForm.title" />
      </el-form-item>
      <el-form-item label="Meeting Time">
        <div id="datetimePickerContainer">
          <el-date-picker
              v-model="minuteDetailForm.date"
              type="date"
              placeholder="Pick a date"
              style="width: 100%; margin-right: 10px;"
          />
          <span class="text-gray-500">-</span>
          <el-time-picker
              v-model="minuteDetailForm.time"
              placeholder="Pick a time"
              style="width: 100%; margin-left: 10px"
          />
        </div>
      </el-form-item>
      <el-form-item label="Minute Taker">
        <el-input v-model="minuteDetailForm.minute_taker" />
      </el-form-item>
      <el-form-item label="Attendees">
        <el-tag
            v-for="tag in minuteDetailForm.attendees"
            :key="tag"
            class="mx-1"
            closable
            :disable-transitions="false"
            @close="handleAttendeeTagClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
            v-if="attendeeInputVisible"
            ref="InputRef"
            v-model="inputAttendee"
            size="small"
            @keyup.enter="handleAttendeeInputConfirm"
            @blur="handleAttendeeInputConfirm"
            style="width: 100px"
        />
        <el-button v-else class="button-new-tag ml-1" size="small" @click="showAttendeeInput">
          + New Attendee
        </el-button>
      </el-form-item>
      <el-form-item label="Meeting Type">
        <el-radio-group v-model="minuteDetailForm.type">
          <el-radio label="Online" />
          <el-radio label="In Person" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Meeting Agenda">
        <el-input
            v-model="minuteDetailForm.agenda"
            type="textarea"
            height="300px"
            :autosize="{ minRows: 8, maxRows: 16}"
        />
      </el-form-item>
    </el-form>
  </div>

  <div class="minuteFormContainer">
    <el-table
        ref="minuteFormRef"
        class="minuteFormTable"
        :data="tableData"
        size="small"
    >
      <el-table-column label="Proposer" min-width="100px">
        <template #default="scope">
          <el-input
              v-model="scope.row.proposer"
              autosize
              @keydown="handleRowKeydown($event, scope)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Type" min-width="100px" >
        <template #default="scope">
          <el-select v-model="scope.row.type" filterable placeholder="Select" >
            <el-option
                v-for="item in action_types"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="Action Item" min-width="150px" >
        <template #default="scope">
          <el-input
              v-model="scope.row.action_item"
              type="textarea"
              autosize
              @keydown="handleRowKeydown($event, scope)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Owner" min-width="100px">
        <template #default="scope">
          <el-input
              v-model="scope.row.owner"
              autosize
              @keydown="handleRowKeydown($event, scope)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Due" width="225px">
        <template #default="scope">
          <div>
            <el-date-picker
                v-model="scope.row.due"
                type="date"
                placeholder="Select Due Date"
                clearable
                @keydown="handleRowKeydown($event, scope)"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column width="70px">
        <template #default="scope">
          <el-icon id="deleteRecordIcon" @click="deleteCurrentRecord(scope.$index)"><CloseBold /></el-icon>
        </template>
      </el-table-column>

    </el-table>

    <el-button @click="addEmptyRecord" :icon="Plus" circle />

  </div>

  <el-input
      v-model="raw_markdown"
      disabled
      :autosize="{ minRows: 4 }"
      type="textarea"
      placeholder="ClipboardItem only works with HTTPS connection which is not the case here, hence, you may have to copy and paste the raw markdown from the textarea here"
  />
</template>

<script lang="ts" setup>
import {getCurrentTime} from "@/utils/myTools";
import {nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch} from "vue";
import type {FormInstance, ElInput} from "element-plus";
import {Plus} from '@element-plus/icons-vue'


const inputAttendee = ref('')
const attendeeInputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()
const raw_markdown = ref('')

const handleAttendeeTagClose = (tag: string) => {
  minuteDetailForm.attendees.splice(minuteDetailForm.attendees.indexOf(tag), 1)
}

const showAttendeeInput = () => {
  attendeeInputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleAttendeeInputConfirm = () => {
  if (inputAttendee.value) {
    minuteDetailForm.attendees.push(inputAttendee.value)
  }
  attendeeInputVisible.value = false
  inputAttendee.value = ''
}



interface Record {
  proposer: string,
  type: string,
  action_item: string,
  owner: string,
  due: string,
}

interface MinuteDetailForm {
  title: string,
  date: string,
  time: string,
  type: string,
  agenda: string,
  minute_taker: string,
  attendees: string[],
  Record: Record[],
}

const minuteDetailForm = reactive({
  title: '',
  date: '',
  time: '',
  type: 'Online',
  minute_taker: '',
  attendees: [] as string[],
  agenda: '',
})

const minuteFormRef = ref<FormInstance>()

const tableData = ref<Record[]>([
  {
    proposer: '',
    type: 'TODO',
    action_item: '',
    owner: '',
    due: '',
  },
]);

const action_types = [
  {
    value: 'TODO',
    label: 'TODO',
  },
  {
    value: 'INFO',
    label: 'INFO',
  },
  {
    value: 'DECISION',
    label: 'DECISION',
  },
  {
    value: 'IDEA',
    label: 'IDEA',
  },
]

const focusOnLastRow = () => {
  // Wait for the DOM to be updated with the new row
  nextTick(() => {
    const input:any = document.querySelector('.minuteFormTable .el-table__body-wrapper tbody tr:last-child .el-input__inner');
    if (input) input.focus();
  });
}

const addEmptyRecord = () => {
  // Create a new empty record
  const emptyRecord = {
    proposer: '',
    type: 'TODO',
    action_item: '',
    owner: '',
    due: '',
  };

  // Add it to the end of the tableData array
  tableData.value.push(emptyRecord);

  focusOnLastRow()

}

const deleteCurrentRecord = (index: number) => {
  tableData.value.splice(index, 1);
  if (tableData.value.length === 0) addEmptyRecord()
  // Wait for the DOM to be updated with the new row

  if (index === tableData.value.length){
    focusOnLastRow()
  }
}

const handleRowKeydown = (event: KeyboardEvent, scope:any) =>{
  const rowIndex = scope.$index;
  const columnIndex = scope.$columnIndex;

  switch (event.code) {
    case "ArrowUp":
      // Prevent default scrolling behavior
      event.preventDefault();

      // Check if there is a previous row in the same column
      if (rowIndex > 0) {
        const previousRowInput:any = document.querySelector(`.minuteFormTable .el-table__body-wrapper tbody tr:nth-child(${rowIndex}) .el-input__inner`);
        if (previousRowInput) previousRowInput.focus()
      }
      break;

    case "ArrowDown":
      // Prevent default scrolling behavior
      event.preventDefault();

      // Check if there is a previous row in the same column
      if (rowIndex < tableData.value.length) {
        const nextRowInput:any = document.querySelector(`.minuteFormTable .el-table__body-wrapper tbody tr:nth-child(${rowIndex+2}) .el-input__inner`);
        console.log(nextRowInput)
        if (nextRowInput) nextRowInput.focus()
      }
      break;
  }

  // when alt key is pressed
  if (event.altKey) {
    switch (event.code) {
      case 'Backspace':
        deleteCurrentRecord(rowIndex);
        break;
      case 'Enter':
        addEmptyRecord();
        break;
    }
  }

}

// map the form into a json object
const getTargetJson = () => {
  let target: MinuteDetailForm = {
    ...toRaw(minuteDetailForm),
    Record: tableData.value
  };

  let targetJson = JSON.stringify(target);
  return targetJson;
}

// store targetJson to db
const handleSave  = () => {
  const targetJson = getTargetJson();
  localStorage.setItem('targetJson', targetJson);
}

const loadTargetJson = () => {
  const targetJsonString:any = localStorage.getItem('targetJson');
  if (targetJsonString !== null) {
    const targetJson = JSON.parse(targetJsonString)
    const { Record, ...targetWithoutRecord } = targetJson;

    Object.assign(minuteDetailForm, targetWithoutRecord)
    tableData.value = Record
  }
}

onMounted(() => {
  loadTargetJson()
})
setInterval(() => {
  handleSave()
}, 10000)

const handleClear = () => {
  localStorage.removeItem('targetJson');

  minuteDetailForm.title = ''
  minuteDetailForm.date = ''
  minuteDetailForm.time = ''
  minuteDetailForm.type = 'Online'
  minuteDetailForm.minute_taker = ''
  minuteDetailForm.attendees = [] as string[]
  minuteDetailForm.agenda = ''

  tableData.value = [
    {
      proposer: '',
      type: 'TODO',
      action_item: '',
      owner: '',
      due: '',
    },
  ];

  raw_markdown.value = ''

}

// copy the form into raw .md format
const handleCopyRaw = () => {
  let target:MinuteDetailForm = JSON.parse(getTargetJson())
  let markdown = `
# Meeting Minute
**Project Title**: ${target.title}

**Meeting Time**: ${new Date(target.date).toLocaleDateString('en-US')} - ${new Date(target.time).toLocaleDateString('en-US')}

**Minute Taker**: ${target.minute_taker}

**Attendees**:
${target.attendees.map(name => `- @${name}`).join('\n')}

## Meeting Agenda
${target.agenda}

## Records
| Proposer | Type | Action Item | Owner | Due |
|----------|------|-------------|-------|-----|
${target.Record.map(record => `| ${record.proposer} | ${record.type} | ${record.action_item.replace(/\n/g, '<br/>')} | ${record.owner} | ${(record.due!=='')?new Date(record.due).toLocaleDateString('en-US'):''} |`).join('\n')}
`
  if (navigator.clipboard && navigator.clipboard.write) {
    // ClipboardItem is available
    const item = new ClipboardItem({ "text/plain": new Blob([markdown], { type: "text/plain" }) });
    navigator.clipboard.write([item]);
  } else {
    // ClipboardItem is not available
    console.log("ClipboardItem is not available.");
  }
  raw_markdown.value = markdown
}

</script>

<style lang="scss" scoped>
.minuteDetailContainer {
  margin-top: 25px
}

.minuteFormContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  gap: 5px;
  margin-top: 25px;
}

#datetimePickerContainer {
  display: flex;
}

.minuteFormTable :deep(.el-input__wrapper) {
  border: none;
  box-shadow: 0 0 0 0;
}

.minuteFormTable :deep(.el-textarea__inner) {
  border: none;
  box-shadow: 0 0 0 0;
}

#deleteRecordIcon {
  cursor: pointer;
}

</style>
