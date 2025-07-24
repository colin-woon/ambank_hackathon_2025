'use client';

import { useState } from 'react';

export default function IssuesPage() {
	const [showForm, setShowForm] = useState(false);
	const [title, setTitle] = useState('');
	const [issues, setIssues] = useState([]);
	const [description, setDescription] = useState('');
	const [feedbackMessage, setFeedbackMessage] = useState('');
	const [feedbackType, setFeedbackType] = useState('');
	const [selectedIssue, setSelectedIssue] = useState(null);

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

		const newIssue = {
			id: Date.now(),
			title,
			description,
			date: new Date().toLocaleString(),
			status: 'New'
		};

		setIssues([newIssue, ...issues]);

		setFeedbackMessage('Issue submitted successfully!');
		setFeedbackType('success');
		setTitle('');
		setDescription('');

		setTimeout(() => {
			setFeedbackMessage('');
			setFeedbackType('');
		}, 2500);
	};

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Data Quality Control Dashboard</h1>

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
			<div style={{ marginTop: '2rem' }}>
				{issues.length === 0 ? (
					<p style={{ marginTop: '2rem' }}>No issues submitted yet.</p>
				) : (
					<table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								<th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Actions</th>
								<th style={{ borderBottom: '2px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Ref No.</th>
								<th style={{ borderBottom: '2px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Title</th>
								<th style={{ borderBottom: '2px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Status</th>
								<th style={{ borderBottom: '2px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Date Created</th>
							</tr>
						</thead>
						<tbody>
							{issues.map((issue, index) => (
								<tr key={issue.id}>
									<td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>
										<button
											onClick={() => setSelectedIssue(issue)}
											style={{
												padding: '0.3rem 0.75rem',
												background: '#0070f3',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer'
											}}
										>
											View
										</button>
									</td>
									<td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{index + 1}</td>
									<td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{issue.title}</td>
									<td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{issue.status}</td>
									<td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{issue.date}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
				{selectedIssue && (
					<div style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0,0,0,0.5)',
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
							<h2 style={{ marginBottom: '1rem' }}>📝 Edit Issue</h2>

							<div style={{ marginBottom: '1rem' }}>
								<label>Title:</label><br />
								<input
									type="text"
									value={selectedIssue.title}
									onChange={(e) =>
										setSelectedIssue({ ...selectedIssue, title: e.target.value })
									}
									style={{
										padding: '0.5rem',
										width: '100%',
										marginTop: '0.25rem'
									}}
								/>
							</div>

							<div style={{ marginBottom: '1rem' }}>
								<label>Description:</label><br />
								<input
									type="text"
									value={selectedIssue.description}
									onChange={(e) =>
										setSelectedIssue({ ...selectedIssue, description: e.target.value })
									}
									style={{
										padding: '0.5rem',
										width: '100%',
										marginTop: '0.25rem'
									}}
								/>
							</div>

							<div style={{ marginBottom: '1.5rem' }}>
								<label>Status:</label><br />
								<select
									value={selectedIssue.status}
									onChange={(e) =>
										setSelectedIssue({ ...selectedIssue, status: e.target.value })
									}
									style={{
										backgroundColor: 'black',
										color: 'white',
										padding: '0.5rem',
										width: '100%',
										marginTop: '0.25rem',
										border: '1px solid white',
										borderRadius: '4px'
									}}
								>
									<option value="New">New</option>
									<option value="In Progress">In Progress</option>
									<option value="Resolved">Resolved</option>
									<option value="Rejected">Rejected</option>
								</select>
							</div>

							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<button
									onClick={() => {
										const updatedIssues = issues.map((issue) =>
											issue.id === selectedIssue.id ? selectedIssue : issue
										);
										setIssues(updatedIssues);
										setSelectedIssue(null);
									}}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#0070f3',
										color: 'white',
										border: 'none',
										borderRadius: '4px'
									}}
								>
									Save
								</button>

								<button
									onClick={() => setSelectedIssue(null)}
									style={{
										padding: '0.5rem 1rem',
										backgroundColor: '#aaa',
										color: 'white',
										border: 'none',
										borderRadius: '4px'
									}}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}


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
