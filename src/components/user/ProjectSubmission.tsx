import React, { useState } from 'react';

const ProjectSubmission: React.FC = () => {
    const [projectFiles, setProjectFiles] = useState<File[]>([]);
    const [projectLink, setProjectLink] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setProjectFiles(Array.from(event.target.files));
        }
    };

    const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectLink(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle the submission logic here
        console.log('Files:', projectFiles);
        console.log('Project Link:', projectLink);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="project-files">Upload Project Files:</label>
                <input
                    type="file"
                    id="project-files"
                    multiple
                    onChange={handleFileChange}
                />
            </div>
            <div>
                <label htmlFor="project-link">Project Link:</label>
                <input
                    type="url"
                    id="project-link"
                    value={projectLink}
                    onChange={handleLinkChange}
                    placeholder="Enter project link"
                />
            </div>
            <button type="submit">Submit Project</button>
        </form>
    );
};

export default ProjectSubmission;