import { format, differenceInMilliseconds } from 'date-fns';

function dateToString(value, stringFormat = 'yyyy-MM-dd') {
	return value ? format(new Date(value), stringFormat) : '';
}

export default dateToString;

export function dateDiffInMS(afterDate, beforeDate) {
	return differenceInMilliseconds(new Date(afterDate), new Date(beforeDate));
}

export function intToTime(i) {
	return `${i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : i === 24 ? 'AM' : 'PM'}`;
}

export function intToUTCText(i) {
	let utcText = 'UTC';
	if (i > 0) {
		utcText = `UTC +${i}`;
	} else if (i < 0) {
		utcText = `UTC ${i}`;
	}
	return utcText;
}

export const ymd = (date, delimiter = '/') => {
	if (!date) {
		console.error('No date provided. Returning empty string.', typeof date);
		return '';
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const _date = String(date.getDate()).padStart(2, '0');

	return `${year}${delimiter}${month}${delimiter}${_date}`;
};

const months = [
	'January',
	'Febuary',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

// Month Day, Year
export const formatDateMDY = (dateString) => {
	const date = new Date(dateString);
	return `${months[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
};
