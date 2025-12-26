import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { authApi } from "../api";

const { TextArea } = Input;
const { Option } = Select;

function EditProfileModal({ visible, onClose, user, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        current_job: user.current_job,
        work_experience: user.work_experience,
        specialization: user.specialization,
        department_id: user.department_id,
      });
    }
  }, [visible, user, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authApi.updateProfile(values);
      message.success("プロフィールを更新しました");
      onSuccess();
      onClose();
    } catch (error) {
      message.error("プロフィールの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="プロフィールを編集"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="保存"
      cancelText="キャンセル"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="名"
          name="first_name"
          rules={[{ required: true, message: "名を入力してください" }]}
        >
          <Input placeholder="太郎" />
        </Form.Item>

        <Form.Item
          label="姓"
          name="last_name"
          rules={[{ required: true, message: "姓を入力してください" }]}
        >
          <Input placeholder="田中" />
        </Form.Item>

        <Form.Item label="自己紹介" name="bio">
          <TextArea
            rows={4}
            placeholder="あなたについて教えてください..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="現在の職務" name="current_job">
          <Input placeholder="例：ABC高等学校 数学教師" />
        </Form.Item>

        <Form.Item label="職務経験" name="work_experience">
          <TextArea
            rows={3}
            placeholder="これまでの職務経験を入力してください..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="専門分野" name="specialization">
          <Input placeholder="例：数学、情報科学" />
        </Form.Item>

        <Form.Item label="部門" name="department_id">
          <Select placeholder="部門を選択してください" allowClear>
            <Option value={1}>数学</Option>
            <Option value={2}>情報</Option>
            <Option value={3}>理科</Option>
            <Option value={4}>英語</Option>
            <Option value={5}>国語</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditProfileModal;

