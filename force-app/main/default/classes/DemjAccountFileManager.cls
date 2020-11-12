public with sharing class DemjAccountFileManager {
    @AuraEnabled(Cacheable=false)
    public static Map<String, String> getFiles(Id id) {
        Map<String, String> imageFileSrc = new Map<String, String>();
        Set<Id> recordIdList = new Set<Id>();
        List<ContentDocumentLink> cdLinks =[Select id,ContentDocumentId, ContentDocument.LatestPublishedVersionID from ContentDocumentLink where LinkedEntityId=:id];
        for(ContentDocumentLink cdl: cdLinks){
              recordIdList.add(cdl.ContentDocumentId);
        }
        system.debug(recordIdList);
        List<ContentVersion> cvs = [
            select Id, 
                                            CreatedDate, 
                                            Title,
                                            Description,
                                            FileType, 
                                            Owner.UserName, 
                                            VersionNumber,
                                            VersionData,
                                            ContentDocumentId 
                                    from ContentVersion 
                                    where IsLatest = true 
                                        and ContentDocumentId in :recordIdList
        ];
        system.debug(cvs);
        for(ContentVersion cv: cvs){
            imageFileSrc.put(cv.ContentDocumentId, EncodingUtil.base64Encode(cv.VersionData));
        }
        return imageFileSrc;
    }

    @AuraEnabled(Cacheable=false)
    public static Id updateFile(Id contentDocumentId, String base64Data) {
        // inserting file
        ContentVersion cv = [
            select Id, 
                CreatedDate, 
                Title,
                Description,
                FileType, 
                Owner.UserName, 
                VersionNumber,
                VersionData,
                ContentDocumentId,
                IsMajorVersion
                                    from ContentVersion 
                                    where IsLatest = true 
                                        and ContentDocumentId =:contentDocumentId];
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        update cv;
        return cv.Id;
    }
}
