//////////////////////////////////////////////////////////////////////////////
// SWD file simple extractor
// Copyright (C) 2005 Vadim Melnik. All rights reserved.
//
// NO WARRANTIES ARE EXTENDED. USE AT YOUR OWN RISK.
//
// To contact the author with suggestions or comments,
// use vmelnikATdocsultant.com.
//


function trace(s)
{
	WScript.Echo(s);
}

function createFolder(fso, folder)
{
	if( fso.FolderExists(folder) )
		return true;

	var baseFolder = fso.GetParentFolderName(folder);
	if( createFolder(fso, baseFolder) )
	{
		fso.CreateFolder(folder);
		return true;
	}
	return false;
}


var FILE_MATCH = new Array(' ', 'f', 'i', 'l', 'e', ':', '/');

function main()
{

	if( WScript.Arguments.length!=1 )
	{
		trace("Copyright (C) 2005 Vadim Melnik.");
		trace("SWD file extractor 1.0. Usage:");
		trace("");
		trace("  swd.js <swd_file_path>");
		return -1;
	}

	var swdFile = WScript.Arguments(0);
	var verbose = true;

	var fso   = new ActiveXObject("Scripting.FileSystemObject");
	var shell = WScript.CreateObject("WScript.Shell");
	var outDir = shell.CurrentDirectory;
	if( (outDir.lastIndexOf('\\')!=outDir.length-1) ||
			(outDir.lastIndexOf('/')!=outDir.length-1) )
		outDir += '\\';

	if( !fso.FileExists(swdFile) )
	{
		trace("File \""+swdFile+"\" not found.");
		return -1;
	}

	var ts = fso.OpenTextFile(swdFile, 1, false, 0);

	var numFiles = 0;
	while( !ts.AtEndOfStream )
	{
		
		var c = ts.Read(1);

		if( c==':' )
		{
			for( var i=0; i<FILE_MATCH.length; i++ )
			{
				c = ts.Read(1);
				if( c!=FILE_MATCH[i] )
					break;
			}

			if( i==FILE_MATCH.length ) // OK, found file name
			{
				var file = ts.ReadLine();
				file = file.replace(/\//gi, "\\");
				file = outDir + file.replace(/\:/gi, "_");
				
				createFolder(fso, fso.GetParentFolderName(file));
				var ts2 = fso.CreateTextFile(file, true, false);
				
				while( c!='\0' )
				{
					c = ts.Read(1);
					if( c!='\0' )
						ts2.Write(c);
				}
				ts2.Close();

				if( verbose )
					trace("Created \""+file+"\".");
				numFiles++;
			}
		}
	}
	ts.Close();

	if( verbose )
		trace("Done. "+numFiles+" files created.");
	return 0;
}

WScript.Quit(main());
