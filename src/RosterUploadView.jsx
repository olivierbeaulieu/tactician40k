import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

class RosterUploadView extends Component {
   async onDrop(acceptedFiles, rejectedFiles) {
     // Do something with files
     console.log(acceptedFiles, rejectedFiles)

     // perform validations
     // display error messages
     // Only accept one file, or allow to process a batch of rosters

     // Verify that at least one file has been accepted
     if (acceptedFiles.length === 0) {
      alert('No files accepted.');
      return;
     }

     // Append all files to a FormData object
     const formData = new FormData();
     for (const file of acceptedFiles) {
      formData.append(file.name, file)
     }

     const xmlData = await fetch('/rosz_to_xml', {
      method: 'PUT',
      body: formData
     }).then(response => response.text());

     // For now, work with a single file memory
     // @TODO Allow multiple files in storage
     localStorage.setItem('roster-data', xmlData);

     window.location.href = '/roster';
   }

   render() {
    return (
      <div className="roster-upload">
        <h2>Upload a .rosz file to view your roster</h2>

        <div className="roster-upload--dropzone">
          <Dropzone  onDrop={this.onDrop}>
            {({getRootProps, getInputProps, isDragActive}) => {
              return (
                <div {...getRootProps()} /*className={classNames('dropzone', {'dropzone--isActive': isDragActive})}*/>
                  <input {...getInputProps()} />
                  {
                    isDragActive ?
                      <p>Drop files here...</p> :
                      <p>Try dropping some files here, or click to select files to upload.</p>
                  }
                </div>
              )
            }}
          </Dropzone>
        </div>
      </div>
    );
  }
}

export default RosterUploadView;