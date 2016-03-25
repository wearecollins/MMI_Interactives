//
//  SysCommand.h
//
//  Created by Brett Renfer on 2/22/12.
//

#pragma once
#include "ofThread.h"

class SysCommand : public ofThread
{
    
public:
    
    SysCommand():bCanceled(false){
        
    }
    
    ofEvent<string> commandComplete;
    
    void callCommand( string command ){
        bCanceled = false;
        cmd = command;
        stopThread();
        startThread();
    }
    
    // CALL THIS DIRECTLY FOR BLOCKING COMMAND
    // thanks to: http://stackoverflow.com/questions/478898/how-to-execute-a-command-and-get-output-of-command-within-c
    std::string execOutput(char* cmd) {
        pipe = popen(cmd, "r");
        if (!pipe) return "ERROR";
        char buffer[128];
        std::string result = "";
        while(!feof(pipe) && !bCanceled) {
            if(fgets(buffer, 128, pipe) != NULL)
                result += buffer;
            if ( bCanceled ){
                break;
            }
        }
        try {
            pclose(pipe);
        } catch (...){
            
        }
        return result;
    }
    
    void cancel(){
        bCanceled = true;
    }
    
    void exec( char * cmd ){
        system( cmd );
    }
    
//protected:
    virtual void threadedFunction(){
        exec( (char *) cmd.c_str() );
        string result = "";
        ofNotifyEvent( commandComplete, result, this );
    }
    
protected:
    FILE* pipe;
    bool bCanceled;
    string cmd;
};

class StringOutputCommand : public SysCommand
{
    
public:
    
    StringOutputCommand() : SysCommand() {
        
    }
    
//protected:
    void threadedFunction(){
        ofLog( OF_LOG_VERBOSE, "call "+cmd );
        string result = execOutput( (char *) cmd.c_str() );
        ofLog( OF_LOG_VERBOSE, "RESULT "+result );
        ofNotifyEvent( commandComplete, result, this );
    }
};