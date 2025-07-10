
import { KEY_MAP } from "@/const/shared";

export const findStepToTranspose = (originalKey: string, previewKey: string) => {
    
    const originalKeyIndex = KEY_MAP[originalKey];
    const previewKeyIndex = KEY_MAP[previewKey];

    const steps = previewKeyIndex - originalKeyIndex; //need to wrap around

    //positive steps are up, negative steps are down
    //if step is greater than 6 or less than -6 can just flip the sign and use the wrap aroud value
    if(steps > 6 || steps < -6) {
        return steps > 0 ? steps-12 : steps+12;
    }
    return steps;
    

}
