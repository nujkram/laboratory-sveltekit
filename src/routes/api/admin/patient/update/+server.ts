import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return new Response(
			JSON.stringify({ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' }),
			{ status: 401 }
		);
	}

	const data = await request.json();
	const { _id, firstName, middleName, lastName, gender, birthDate, address, baseUpdated, force } = data;

	const db = await clientPromise();
	const Patient = db.collection('patients');

	// Conflict: the patient changed on another device since this edit was made.
	if (!force && baseUpdated) {
		const existing = await Patient.findOne({ _id });
		if (existing?.updated && new Date(existing.updated).getTime() > new Date(baseUpdated).getTime()) {
			return new Response(
				JSON.stringify({ status: 'Conflict', message: 'This patient was changed on another device since you edited it.' }),
				{ status: 409 }
			);
		}
	}

	const set: any = {
		firstName: firstName || '',
		middleName: middleName || '',
		lastName: lastName || '',
		gender: gender || '',
		address: address || '',
		completeName: middleName
			? `${firstName} ${middleName} ${lastName}`
			: `${firstName} ${lastName}`,
		updated: new Date()
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
