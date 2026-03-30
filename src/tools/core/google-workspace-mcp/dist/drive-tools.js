import * as fs from 'node:fs';
import { runGws } from './gws-runner.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
const execAsync = promisify(exec);
export async function driveListFiles(args) {
    const params = {};
    if (args.q)
        params.q = args.q;
    if (args.pageSize)
        params.pageSize = args.pageSize;
    if (args.pageToken)
        params.pageToken = args.pageToken;
    const result = await runGws('drive', 'files', 'list', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list files' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function driveGetFileContent(args) {
    // First, get the file's metadata to check its mimeType
    const metaResult = await runGws('drive', 'files', 'get', {
        params: { fileId: args.id }
    });
    if (!metaResult.success) {
        return { isError: true, content: [{ type: 'text', text: metaResult.error || 'Failed to get file metadata' }] };
    }
    const fileMeta = metaResult.data;
    const isGoogleDoc = fileMeta.mimeType?.startsWith('application/vnd.google-apps.');
    // Use a local temp file because gws restricts output to the current directory
    const tempFile = `gws-drive-${args.id}-${Date.now()}.tmp`;
    try {
        if (isGoogleDoc) {
            // For Google Docs/Sheets/Slides, we need to export them (defaulting to text/plain if possible)
            // We use gws files export
            const exportMime = fileMeta.mimeType === 'application/vnd.google-apps.spreadsheet' ? 'text/csv' : 'text/plain';
            // Use raw exec because runGws is tuned for JSON output, not file download
            const cmd = `gws drive files export --params "{\\"fileId\\": \\"${args.id}\\", \\"mimeType\\": \\"${exportMime}\\"}" --output "${tempFile}"`;
            await execAsync(cmd);
        }
        else {
            // For binary/plain files, we use gws files get with alt=media
            const cmd = `gws drive files get --params "{\\"fileId\\": \\"${args.id}\\", \\"alt\\": \\"media\\"}" --output "${tempFile}"`;
            await execAsync(cmd);
        }
        const content = fs.readFileSync(tempFile, 'utf-8');
        // Cleanup
        fs.unlinkSync(tempFile);
        return {
            content: [{ type: 'text', text: content }]
        };
    }
    catch (error) {
        if (fs.existsSync(tempFile))
            fs.unlinkSync(tempFile);
        return {
            isError: true,
            content: [{ type: 'text', text: `Failed to read file content: ${error.message}` }]
        };
    }
}
export async function driveCreateFile(args) {
    const metadata = { name: args.name };
    if (args.mimeType)
        metadata.mimeType = args.mimeType;
    if (args.parents)
        metadata.parents = args.parents;
    let command = `gws drive files create --json ${JSON.stringify(JSON.stringify(metadata))} --format json`;
    let tempFile = null;
    try {
        if (args.content) {
            tempFile = `gws-upload-${Date.now()}.tmp`;
            fs.writeFileSync(tempFile, args.content);
            command += ` --upload "${tempFile}"`;
        }
        const { stdout } = await execAsync(command);
        if (tempFile && fs.existsSync(tempFile))
            fs.unlinkSync(tempFile);
        return {
            content: [{ type: 'text', text: `File created successfully: ${stdout}` }]
        };
    }
    catch (error) {
        if (tempFile && fs.existsSync(tempFile))
            fs.unlinkSync(tempFile);
        return {
            isError: true,
            content: [{ type: 'text', text: `Failed to create file: ${error.message}` }]
        };
    }
}
export async function driveUpdateFile(args) {
    const metadata = {};
    if (args.name)
        metadata.name = args.name;
    let command = `gws drive files update --params "{\\"fileId\\": \\"${args.id}\\"}" --format json`;
    if (Object.keys(metadata).length > 0) {
        command += ` --json ${JSON.stringify(JSON.stringify(metadata))}`;
    }
    let tempFile = null;
    try {
        if (args.content) {
            tempFile = `gws-update-${Date.now()}.tmp`;
            fs.writeFileSync(tempFile, args.content);
            command += ` --upload "${tempFile}"`;
        }
        const { stdout } = await execAsync(command);
        if (tempFile && fs.existsSync(tempFile))
            fs.unlinkSync(tempFile);
        return {
            content: [{ type: 'text', text: `File updated successfully: ${stdout}` }]
        };
    }
    catch (error) {
        if (tempFile && fs.existsSync(tempFile))
            fs.unlinkSync(tempFile);
        return {
            isError: true,
            content: [{ type: 'text', text: `Failed to update file: ${error.message}` }]
        };
    }
}
export async function driveDeleteFile(args) {
    if (args.permanent) {
        const result = await runGws('drive', 'files', 'delete', {
            params: { fileId: args.id }
        });
        if (!result.success)
            return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to delete file' }] };
        return { content: [{ type: 'text', text: `File ${args.id} permanently deleted.` }] };
    }
    else {
        // Move to trash
        const result = await runGws('drive', 'files', 'update', {
            params: { fileId: args.id },
            json: { trashed: true }
        });
        if (!result.success)
            return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to trash file' }] };
        return { content: [{ type: 'text', text: `File ${args.id} moved to trash.` }] };
    }
}
export async function driveCreateFolder(args) {
    return await driveCreateFile({
        name: args.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: args.parents
    });
}
export async function driveMoveFile(args) {
    const params = {
        fileId: args.id,
        addParents: args.addParents.join(','),
        removeParents: args.removeParents.join(',')
    };
    const result = await runGws('drive', 'files', 'update', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to move file' }] };
    }
    return {
        content: [{ type: 'text', text: `File ${args.id} moved successfully.` }]
    };
}
export async function driveGetFileMetadata(args) {
    const params = { fileId: args.id };
    if (args.fields)
        params.fields = args.fields;
    const result = await runGws('drive', 'files', 'get', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to get file metadata' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
