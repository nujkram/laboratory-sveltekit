import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: any) {
	const data = await request.json();
	const { _id, firstName, middleName, lastName, gender, birthDate, address } = data;

	const db = await clientPromise();
	const Patient = db.collection('patients');

	const set: any = {
		firstName: firstName || '',
		middleName: middleName || '',
		lastName: lastName || '',
		gender: gender || '',
		address: address || '',
		completeName: middleName
			? `${firstName} ${middleName} ${lastName}`
			: `${firstName} ${lastName}`
	};
	// Only overwrite birthDate when a value is supplied, and store it as a Date.
	if (birthDate) set.birthDate = new Date(birthDate);

	const response = await Patient.updateOne({ _id: _id }, { $set: set });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'Patient successfully updated',
			response
		})
	);
}
