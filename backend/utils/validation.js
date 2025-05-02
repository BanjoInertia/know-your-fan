
export const validateEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validateCpf = (cpf) => {
    if (!cpf) return false;
    const cleanedCpf = String(cpf).replace(/\D/g, '');
    return cleanedCpf.length === 11;
};

export const validateBirthDate = (date) => {
    if (!date) return false;
    const dateString = String(date);
    const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!pattern.test(dateString)) {
        return false;
    }

    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (year < 1900 || year > new Date().getFullYear() || month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) {
        return false;
    }

    return true;
};

export const validateCep = (cep) => {
    if (!cep) return false;
    const cleanedCep = String(cep).replace(/\D/g, '');
    return cleanedCep.length === 8;
};

export const formatCpf = (value) => {
    if (!value) return '';
    value = String(value).replace(/\D/g, '');
    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    return value.slice(0, 14);
};

export const formatBirthDate = (value) => {
    if (!value) return '';
    value = String(value).replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    return value.slice(0, 10);
};

export const formatCep = (value) => {
    if (!value) return '';
    value = String(value).replace(/\D/g, '');
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    return value.slice(0, 9);
};