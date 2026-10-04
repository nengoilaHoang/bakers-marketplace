import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';

type PostFieldsProps = Readonly<{
  title: string;
  content: string;
  tagsInput: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsInputChange: (value: string) => void;
  disabled?: boolean;
}>;

// Các ô nhập chung của form tạo / sửa bài viết.
export default function PostFields({
  title,
  content,
  tagsInput,
  onTitleChange,
  onContentChange,
  onTagsInputChange,
  disabled,
}: PostFieldsProps) {
  return (
    <>
      <Field label='Tiêu đề' htmlFor='post-title' required>
        <Input
          id='post-title'
          size='lg'
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          required
          maxLength={255}
          disabled={disabled}
          placeholder='Bạn muốn chia sẻ hoặc hỏi điều gì?'
        />
      </Field>
      <Field label='Nội dung' htmlFor='post-content' required>
        <Textarea
          id='post-content'
          rows={8}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          required
          disabled={disabled}
          placeholder='Viết nội dung bài viết...'
        />
      </Field>
      <Field label='Tag' htmlFor='post-tags' hint='Cách nhau bằng dấu phẩy, tối đa 10 tag'>
        <Input
          id='post-tags'
          value={tagsInput}
          onChange={(event) => onTagsInputChange(event.target.value)}
          disabled={disabled}
          placeholder='vd: cake, matcha, tips'
        />
      </Field>
    </>
  );
}
