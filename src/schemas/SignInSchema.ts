import * as yup from 'yup'

export const SignInSchema = yup.object().shape({
    email: yup.string()
        .required('Email không được để trống')
        .test('valid-email', 'Email không hợp lệ. Vui lòng nhập đúng định dạng email', (value) => {
            if (!value) return true;

            const emailRegex = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/;
            return emailRegex.test(value);
        }),
    password: yup.string().required('Mật khẩu không được để trống'),
})
