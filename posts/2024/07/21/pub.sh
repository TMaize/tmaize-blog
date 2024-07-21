folder=~/.ssh

if [ ! -d "$folder" ]; then
    echo "mkdir $folder"
    mkdir $folder
    chmod 700 $folder
fi

file=~/.ssh/authorized_keys

if [ ! -f "$file" ]; then
    echo "touch $file"
    touch $file
    chmod 600 $file
fi

pubKey="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDCL9SZIEDzH0DpaurSnL2pTzTBJjGKJ2N/+FF6pNuc2tjkoWvkdTwWWWXeXsYMa38K03n2uUmV5BLOGTVcnSamzDtDMYZGMypGlV+B3cseqRLlAKBKWJc0K+rtwvjwJcmcPEU4dwMRC/K/ffbx3NHmAs5z2RzB4HBriTUIL68XIFWwQqHmX8VmETlyTE//z/2KnMoLC9sG8IMXj1guaALBCvOIBQVxxHgSFPj87wcXjLS2/7xMjj/PAuPxE47aHujtwzFLsy5TK49dpdOgjHFkmJZJm8anGXxL8THB+epGOl4QUF20ginVMWKuk8aVEln6l/pgyGZh5hNg+qDwSR55"


if grep -q "$pubKey" $file; then
    echo "pubKey already in $file"
else
    echo "add pubKey to $file"
    echo $pubKey >> $file
fi
