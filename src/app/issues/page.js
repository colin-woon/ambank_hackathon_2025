'use client';

import { useState } from 'react';

export default function IssuesPage() {
	const [showForm, setShowForm] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [feedbackMessage, setFeedbackMessage] = useState('');
	const [feedbackType, setFeedbackType] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!title.trim() || !description.trim()) {
			setFeedbackMessage('Please fill in both Title and Description.');
			setFeedbackType('error');
			setTimeout(() => {
				setFeedbackMessage('');
				setFeedbackType('');
			}, 2500);
			return;
		}
		console.log('Submitted issue:');
		console.log({ title, description });
		setFeedbackMessage('Issue submitted successfully!');
		setFeedbackType('success');
		setTitle('');
		setDescription('');

		setTimeout(() => {
			setFeedbackMessage('');
			setFeedbackType('');
			setShowForm(false); // optional
		}, 2500);
	};

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Issues Page</h1>

			<button
				onClick={() => setShowForm(true)}
				style={{
					padding: '0.75rem 1.5rem',
					background: '#0070f3',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					marginTop: '1rem'
				}}
			>
				+ Report New Issue
			</button>

			{showForm && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000
				}}>
					<div style={{
						backgroundColor: 'black',
						padding: '2rem',
						borderRadius: '10px',
						width: '90%',
						maxWidth: '500px'
					}}>
						<h2 style={{ marginBottom: '1rem' }} >Report a Data Quality Issue</h2>
						<form onSubmit={handleSubmit}>
							<div>
								<label>Title:</label><br />
								<input
									type="text"
									placeholder="Enter a title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									style={{
										padding: '0.5rem',
										width: '100%',
										marginBottom: '1rem'
									}}
								/>
							</div>

							<div>
								<label>Description:</label><br />
								<input
									type="text"
									placeholder="Describe the issue"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									style={{
										padding: '0.5rem',
										width: '100%',
										marginBottom: '1rem'
									}}
								/>
							</div>

							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<button
									type="submit"
									style={{
										padding: '0.5rem 1rem',
										background: '#0070f3',
										color: 'white',
										border: 'none',
										borderRadius: '4px'
									}}
								>
									Submit
								</button>

								<button
									type="button"
									onClick={() => setShowForm(false)}
									style={{
										padding: '0.5rem 1rem',
										background: '#aaa',
										color: 'white',
										border: 'none',
										borderRadius: '4px'
									}}
								>
									Cancel
								</button>
							</div>
						</form>

						{feedbackMessage && (
							<p style={{
								marginTop: '1rem',
								fontWeight: 'bold',
								color: feedbackType === 'success' ? 'green' : 'red'
							}}>
								{feedbackMessage}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
